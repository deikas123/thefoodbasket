-- Create product bundles table
CREATE TABLE IF NOT EXISTS public.product_bundles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  discount_percentage numeric DEFAULT 0,
  active boolean DEFAULT true,
  image text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create bundle items junction table
CREATE TABLE IF NOT EXISTS public.bundle_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bundle_id uuid NOT NULL REFERENCES public.product_bundles(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(bundle_id, product_id)
);

-- Enable RLS
ALTER TABLE public.product_bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bundle_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for bundles
CREATE POLICY "Active bundles are viewable by everyone"
  ON public.product_bundles
  FOR SELECT
  USING (active = true);

CREATE POLICY "Admins can manage bundles"
  ON public.product_bundles
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Bundle items are viewable by everyone"
  ON public.bundle_items
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage bundle items"
  ON public.bundle_items
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_bundle_items_bundle ON public.bundle_items(bundle_id);
CREATE INDEX IF NOT EXISTS idx_bundle_items_product ON public.bundle_items(product_id);

-- Create loyalty transactions table for detailed tracking
CREATE TABLE IF NOT EXISTS public.loyalty_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  points integer NOT NULL,
  transaction_type text NOT NULL, -- 'earned' or 'spent'
  source text NOT NULL, -- 'purchase', 'review', 'referral', 'redemption'
  description text,
  order_id uuid REFERENCES public.orders(id),
  review_id uuid REFERENCES public.product_reviews(id),
  referrer_user_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own loyalty transactions"
  ON public.loyalty_transactions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all loyalty transactions"
  ON public.loyalty_transactions
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- System can insert loyalty transactions
CREATE POLICY "System can insert loyalty transactions"
  ON public.loyalty_transactions
  FOR INSERT
  WITH CHECK (true);

-- Create index for loyalty transactions
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_user ON public.loyalty_transactions(user_id, created_at DESC);

-- Create referral tracking table
CREATE TABLE IF NOT EXISTS public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_user_id uuid NOT NULL,
  referred_user_id uuid NOT NULL,
  referral_code text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'rewarded'
  referrer_points_earned integer DEFAULT 0,
  referred_points_earned integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  completed_at timestamp with time zone,
  UNIQUE(referrer_user_id, referred_user_id)
);

-- Enable RLS
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view referrals they are part of"
  ON public.referrals
  FOR SELECT
  USING (auth.uid() = referrer_user_id OR auth.uid() = referred_user_id);

CREATE POLICY "Users can create referrals"
  ON public.referrals
  FOR INSERT
  WITH CHECK (auth.uid() = referrer_user_id);

CREATE POLICY "System can update referrals"
  ON public.referrals
  FOR UPDATE
  USING (true);

-- Create index for referrals
CREATE INDEX IF NOT EXISTS idx_referrals_code ON public.referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON public.referrals(referrer_user_id);

-- Add referral code to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS referral_code text UNIQUE,
ADD COLUMN IF NOT EXISTS referred_by uuid REFERENCES public.profiles(id);

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  code text;
  exists boolean;
BEGIN
  LOOP
    -- Generate 8 character code
    code := upper(substring(md5(random()::text) from 1 for 8));
    
    -- Check if it exists
    SELECT EXISTS(SELECT 1 FROM profiles WHERE referral_code = code) INTO exists;
    
    -- Exit loop if unique
    EXIT WHEN NOT exists;
  END LOOP;
  
  RETURN code;
END;
$$;

-- Function to award loyalty points for reviews
CREATE OR REPLACE FUNCTION award_points_for_review()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  points_to_award integer := 50; -- 50 points per review
BEGIN
  -- Award points
  UPDATE profiles
  SET loyalty_points = loyalty_points + points_to_award
  WHERE id = NEW.user_id;
  
  -- Record transaction
  INSERT INTO loyalty_transactions (
    user_id,
    points,
    transaction_type,
    source,
    description,
    review_id
  ) VALUES (
    NEW.user_id,
    points_to_award,
    'earned',
    'review',
    'Points earned for product review',
    NEW.id
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger for review points
DROP TRIGGER IF EXISTS award_review_points_trigger ON public.product_reviews;
CREATE TRIGGER award_review_points_trigger
  AFTER INSERT ON public.product_reviews
  FOR EACH ROW
  EXECUTE FUNCTION award_points_for_review();

-- Function to get frequently bought together products
CREATE OR REPLACE FUNCTION get_frequently_bought_together(
  p_product_id uuid,
  p_limit integer DEFAULT 6
)
RETURNS TABLE (
  product_id uuid,
  purchase_count bigint,
  confidence_score numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH product_orders AS (
    -- Get all orders containing the target product
    SELECT DISTINCT o.id as order_id
    FROM orders o
    CROSS JOIN LATERAL jsonb_array_elements(o.items) AS item
    WHERE (item->>'productId')::uuid = p_product_id
  ),
  co_purchased_products AS (
    -- Get products bought in the same orders
    SELECT 
      (item->>'productId')::uuid as product_id,
      COUNT(*) as purchase_count
    FROM product_orders po
    JOIN orders o ON o.id = po.order_id
    CROSS JOIN LATERAL jsonb_array_elements(o.items) AS item
    WHERE (item->>'productId')::uuid != p_product_id
    GROUP BY (item->>'productId')::uuid
  )
  SELECT 
    cpp.product_id,
    cpp.purchase_count,
    (cpp.purchase_count::numeric / NULLIF((SELECT COUNT(*) FROM product_orders), 0) * 100)::numeric as confidence_score
  FROM co_purchased_products cpp
  JOIN products p ON p.id = cpp.product_id
  WHERE p.stock > 0
  ORDER BY cpp.purchase_count DESC, confidence_score DESC
  LIMIT p_limit;
END;
$$;