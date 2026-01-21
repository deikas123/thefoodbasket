-- Insert default loyalty settings if none exist
INSERT INTO public.loyalty_settings (
  id,
  points_per_ksh,
  ksh_per_point,
  min_redemption_points,
  bronze_threshold,
  bronze_multiplier,
  silver_threshold,
  silver_multiplier,
  gold_threshold,
  gold_multiplier,
  points_expiration_days,
  referral_signup_bonus,
  referral_purchase_bonus
)
SELECT 
  gen_random_uuid(),
  1.0,       -- 1 point per KSH spent
  0.1,       -- 0.1 KSH per point (10 points = 1 KSH)
  100,       -- Minimum 100 points to redeem
  0,         -- Bronze starts at 0 points
  1.0,       -- Bronze multiplier 1x
  500,       -- Silver at 500 points
  1.5,       -- Silver multiplier 1.5x
  2000,      -- Gold at 2000 points
  2.0,       -- Gold multiplier 2x
  365,       -- Points expire after 365 days
  100,       -- 100 points signup bonus for referral
  200        -- 200 points purchase bonus for referral
WHERE NOT EXISTS (SELECT 1 FROM public.loyalty_settings LIMIT 1);

-- Create function to process loyalty redemption if it doesn't exist
CREATE OR REPLACE FUNCTION public.process_loyalty_redemption(
  p_user_id UUID,
  p_points INTEGER,
  p_ksh_value NUMERIC
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_wallet_id UUID;
  v_transaction_id UUID;
  v_redemption_id UUID;
  v_current_points INTEGER;
BEGIN
  -- Get current points
  SELECT loyalty_points INTO v_current_points
  FROM profiles
  WHERE id = p_user_id;
  
  IF v_current_points IS NULL OR v_current_points < p_points THEN
    RAISE EXCEPTION 'Insufficient loyalty points';
  END IF;
  
  -- Get or create wallet
  SELECT id INTO v_wallet_id
  FROM wallets
  WHERE user_id = p_user_id;
  
  IF v_wallet_id IS NULL THEN
    INSERT INTO wallets (user_id, balance)
    VALUES (p_user_id, 0)
    RETURNING id INTO v_wallet_id;
  END IF;
  
  -- Create wallet transaction
  INSERT INTO wallet_transactions (wallet_id, amount, type, description, status)
  VALUES (v_wallet_id, p_ksh_value, 'credit', 'Loyalty points redemption', 'completed')
  RETURNING id INTO v_transaction_id;
  
  -- Update wallet balance
  UPDATE wallets
  SET balance = balance + p_ksh_value,
      updated_at = now()
  WHERE id = v_wallet_id;
  
  -- Deduct points from profile
  UPDATE profiles
  SET loyalty_points = loyalty_points - p_points,
      points_last_activity = now()
  WHERE id = p_user_id;
  
  -- Create redemption record
  INSERT INTO loyalty_redemptions (
    user_id, 
    points_redeemed, 
    ksh_value, 
    wallet_transaction_id,
    status,
    redemption_type
  )
  VALUES (
    p_user_id, 
    p_points, 
    p_ksh_value, 
    v_transaction_id,
    'completed',
    'wallet_credit'
  )
  RETURNING id INTO v_redemption_id;
  
  -- Create loyalty transaction record
  INSERT INTO loyalty_transactions (
    user_id,
    points,
    transaction_type,
    source,
    description
  )
  VALUES (
    p_user_id,
    p_points,
    'redeemed',
    'wallet_redemption',
    'Redeemed ' || p_points || ' points for ' || p_ksh_value || ' KSH wallet credit'
  );
  
  RETURN v_redemption_id;
END;
$$;

-- Create increment discount code usage function
CREATE OR REPLACE FUNCTION public.increment_discount_code_usage(code_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE discount_codes
  SET usage_count = usage_count + 1,
      updated_at = now()
  WHERE id = code_id;
END;
$$;