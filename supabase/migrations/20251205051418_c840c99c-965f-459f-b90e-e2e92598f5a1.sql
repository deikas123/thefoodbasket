-- Add expiration settings to loyalty_settings
ALTER TABLE public.loyalty_settings 
ADD COLUMN IF NOT EXISTS points_expiration_days integer DEFAULT 365,
ADD COLUMN IF NOT EXISTS referral_signup_bonus integer DEFAULT 100,
ADD COLUMN IF NOT EXISTS referral_purchase_bonus integer DEFAULT 200;

-- Add last activity tracking to profiles for expiration
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS points_last_activity timestamp with time zone DEFAULT now();

-- Create function to award referral purchase bonus
CREATE OR REPLACE FUNCTION public.award_referral_purchase_bonus()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  referrer_id uuid;
  referral_record record;
  bonus_points integer;
BEGIN
  -- Only process new orders with status 'delivered' or first order change to processing
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.status = 'pending' AND NEW.status IN ('processing', 'delivered')) THEN
    -- Check if user was referred
    SELECT referred_by INTO referrer_id
    FROM profiles
    WHERE id = NEW.user_id;
    
    IF referrer_id IS NOT NULL THEN
      -- Check if this is the first completed order for this user
      IF NOT EXISTS (
        SELECT 1 FROM orders 
        WHERE user_id = NEW.user_id 
        AND id != NEW.id 
        AND status IN ('processing', 'dispatched', 'out_for_delivery', 'delivered')
      ) THEN
        -- Get referral purchase bonus from settings
        SELECT referral_purchase_bonus INTO bonus_points
        FROM loyalty_settings
        LIMIT 1;
        
        bonus_points := COALESCE(bonus_points, 200);
        
        -- Check if bonus was already awarded for this referral
        IF NOT EXISTS (
          SELECT 1 FROM referrals 
          WHERE referred_user_id = NEW.user_id 
          AND referrer_user_id = referrer_id 
          AND status = 'completed'
        ) THEN
          -- Award bonus to referrer
          UPDATE profiles
          SET loyalty_points = loyalty_points + bonus_points,
              points_last_activity = now()
          WHERE id = referrer_id;
          
          -- Record transaction for referrer
          INSERT INTO loyalty_transactions (
            user_id, points, transaction_type, source, description, order_id
          ) VALUES (
            referrer_id, bonus_points, 'earned', 'referral', 
            'Bonus for referred friend''s first purchase', NEW.id
          );
          
          -- Update referral status
          UPDATE referrals
          SET status = 'completed',
              completed_at = now(),
              referrer_points_earned = referral_signup_bonus + bonus_points
          FROM loyalty_settings
          WHERE referred_user_id = NEW.user_id 
          AND referrer_user_id = referrer_id;
          
          -- If no referral record exists, create one
          IF NOT FOUND THEN
            INSERT INTO referrals (
              referrer_user_id, referred_user_id, referral_code, status, completed_at, referrer_points_earned
            ) 
            SELECT 
              referrer_id, NEW.user_id, p.referral_code, 'completed', now(), bonus_points
            FROM profiles p
            WHERE p.id = referrer_id;
          END IF;
        END IF;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for referral purchase bonus
DROP TRIGGER IF EXISTS on_order_status_change_referral ON orders;
CREATE TRIGGER on_order_status_change_referral
  AFTER INSERT OR UPDATE OF status ON orders
  FOR EACH ROW
  EXECUTE FUNCTION award_referral_purchase_bonus();

-- Update points_last_activity when earning points
CREATE OR REPLACE FUNCTION public.update_points_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE profiles
  SET points_last_activity = now()
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_loyalty_transaction_activity ON loyalty_transactions;
CREATE TRIGGER on_loyalty_transaction_activity
  AFTER INSERT ON loyalty_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_points_activity();

-- Create function to expire inactive points
CREATE OR REPLACE FUNCTION public.expire_inactive_points()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  settings_record record;
  profile_record record;
BEGIN
  -- Get expiration settings
  SELECT points_expiration_days INTO settings_record
  FROM loyalty_settings
  LIMIT 1;
  
  IF settings_record.points_expiration_days IS NULL OR settings_record.points_expiration_days <= 0 THEN
    RETURN; -- No expiration configured
  END IF;
  
  -- Find and expire points for inactive users
  FOR profile_record IN 
    SELECT id, loyalty_points, points_last_activity
    FROM profiles
    WHERE loyalty_points > 0
    AND points_last_activity < now() - (settings_record.points_expiration_days || ' days')::interval
  LOOP
    -- Record expiration transaction
    INSERT INTO loyalty_transactions (
      user_id, points, transaction_type, source, description
    ) VALUES (
      profile_record.id, profile_record.loyalty_points, 'expired', 'expiration',
      'Points expired due to inactivity'
    );
    
    -- Zero out points
    UPDATE profiles
    SET loyalty_points = 0
    WHERE id = profile_record.id;
  END LOOP;
END;
$$;