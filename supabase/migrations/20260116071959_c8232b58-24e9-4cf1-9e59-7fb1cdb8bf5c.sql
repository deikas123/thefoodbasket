
-- =============================================
-- 1. CUSTOM ROLES SYSTEM - Allow admin to create custom roles
-- =============================================

-- Create a table to store custom role definitions
CREATE TABLE IF NOT EXISTS public.role_definitions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  permissions JSONB DEFAULT '[]'::jsonb,
  is_system_role BOOLEAN DEFAULT false,
  color TEXT DEFAULT '#6B7280',
  icon TEXT DEFAULT 'user',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default system roles
INSERT INTO public.role_definitions (name, display_name, description, is_system_role, color, icon) VALUES
  ('admin', 'Administrator', 'Full system access', true, '#EF4444', 'shield'),
  ('customer', 'Customer', 'Regular customer', true, '#10B981', 'user'),
  ('delivery', 'Delivery Rider', 'Delivery personnel', true, '#F97316', 'truck'),
  ('packer', 'Order Packer', 'Warehouse packer', true, '#8B5CF6', 'package'),
  ('customer_service', 'Customer Service', 'Customer support staff', true, '#3B82F6', 'headphones'),
  ('order_fulfillment', 'Order Fulfillment', 'Order processing staff', true, '#22C55E', 'clipboard-list'),
  ('accountant', 'Accountant', 'Financial management', true, '#A855F7', 'calculator'),
  ('store_manager', 'Store Manager', 'Store management', true, '#EC4899', 'store')
ON CONFLICT (name) DO NOTHING;

-- Enable RLS
ALTER TABLE public.role_definitions ENABLE ROW LEVEL SECURITY;

-- Policies for role_definitions
CREATE POLICY "Anyone can view active roles" ON public.role_definitions
  FOR SELECT USING (active = true);

CREATE POLICY "Admins can manage roles" ON public.role_definitions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- =============================================
-- 2. PAYMENT SETTINGS - Admin selectable payment methods
-- =============================================

CREATE TABLE IF NOT EXISTS public.payment_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  payment_method TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  enabled BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  min_amount DECIMAL(10,2) DEFAULT 0,
  max_amount DECIMAL(10,2),
  processing_fee_percentage DECIMAL(5,2) DEFAULT 0,
  processing_fee_fixed DECIMAL(10,2) DEFAULT 0,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default payment methods
INSERT INTO public.payment_settings (payment_method, display_name, description, icon, enabled, sort_order) VALUES
  ('mpesa', 'M-Pesa', 'Pay with M-Pesa STK Push', 'smartphone', true, 1),
  ('card', 'Credit/Debit Card', 'Pay with Visa, Mastercard', 'credit-card', false, 2),
  ('wallet', 'E-Wallet', 'Pay using your store wallet balance', 'wallet', true, 3),
  ('paylater', 'Buy Now, Pay Later', 'Pay within 30 days with no interest', 'calendar', true, 4),
  ('cod', 'Cash on Delivery', 'Pay with cash when your order is delivered', 'banknote', true, 5)
ON CONFLICT (payment_method) DO NOTHING;

ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view enabled payments" ON public.payment_settings
  FOR SELECT USING (enabled = true);

CREATE POLICY "Admins can manage payments" ON public.payment_settings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- =============================================
-- 3. ENHANCED BNPL - Credit limit based system
-- =============================================

-- Add credit_limit and status fields to kyc_verifications
ALTER TABLE public.kyc_verifications 
  ADD COLUMN IF NOT EXISTS credit_limit DECIMAL(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS credit_used DECIMAL(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS credit_score INTEGER,
  ADD COLUMN IF NOT EXISTS income_bracket TEXT,
  ADD COLUMN IF NOT EXISTS employment_status TEXT,
  ADD COLUMN IF NOT EXISTS employer_name TEXT,
  ADD COLUMN IF NOT EXISTS national_id TEXT;

-- Create BNPL transactions table for tracking
CREATE TABLE IF NOT EXISTS public.bnpl_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id),
  principal_amount DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  paid_amount DECIMAL(10,2) DEFAULT 0,
  interest_rate DECIMAL(5,2) DEFAULT 0,
  installments INTEGER DEFAULT 1,
  installment_amount DECIMAL(10,2) NOT NULL,
  next_payment_date DATE NOT NULL,
  due_date DATE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'overdue', 'defaulted', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- BNPL installments tracking
CREATE TABLE IF NOT EXISTS public.bnpl_installments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id UUID NOT NULL REFERENCES public.bnpl_transactions(id) ON DELETE CASCADE,
  installment_number INTEGER NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  due_date DATE NOT NULL,
  paid_at TIMESTAMP WITH TIME ZONE,
  payment_method TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'waived')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.bnpl_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bnpl_installments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own BNPL transactions" ON public.bnpl_transactions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can view own BNPL installments" ON public.bnpl_installments
  FOR SELECT USING (
    transaction_id IN (SELECT id FROM public.bnpl_transactions WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can manage BNPL" ON public.bnpl_transactions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can manage BNPL installments" ON public.bnpl_installments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- =============================================
-- 4. ENHANCED FOOD BASKETS - Sharing, templates, nutrition
-- =============================================

-- Add new columns to food_baskets
ALTER TABLE public.food_baskets
  ADD COLUMN IF NOT EXISTS is_template BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_shared BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS share_code TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS category TEXT,
  ADD COLUMN IF NOT EXISTS dietary_tags TEXT[],
  ADD COLUMN IF NOT EXISTS total_calories INTEGER,
  ADD COLUMN IF NOT EXISTS total_protein DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS total_carbs DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS total_fat DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS prep_time INTEGER,
  ADD COLUMN IF NOT EXISTS servings INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS saves_count INTEGER DEFAULT 0;

-- Food basket likes
CREATE TABLE IF NOT EXISTS public.food_basket_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  basket_id UUID NOT NULL REFERENCES public.food_baskets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(basket_id, user_id)
);

-- Food basket saves (user's saved baskets from shared)
CREATE TABLE IF NOT EXISTS public.food_basket_saves (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  basket_id UUID NOT NULL REFERENCES public.food_baskets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(basket_id, user_id)
);

ALTER TABLE public.food_basket_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_basket_saves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own likes" ON public.food_basket_likes
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can manage own saves" ON public.food_basket_saves
  FOR ALL USING (user_id = auth.uid());

-- =============================================
-- 5. DELIVERY DISTANCE & ROUTE OPTIMIZATION
-- =============================================

-- Add customer location fields to addresses
ALTER TABLE public.addresses
  ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,8),
  ADD COLUMN IF NOT EXISTS longitude DECIMAL(11,8),
  ADD COLUMN IF NOT EXISTS formatted_address TEXT,
  ADD COLUMN IF NOT EXISTS plus_code TEXT;

-- Delivery route optimization table
CREATE TABLE IF NOT EXISTS public.delivery_routes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rider_id UUID NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled')),
  total_distance DECIMAL(10,2),
  total_duration INTEGER, -- in minutes
  optimized_order JSONB, -- array of order IDs in optimized sequence
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add distance to orders
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS delivery_distance DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS delivery_route_id UUID REFERENCES public.delivery_routes(id),
  ADD COLUMN IF NOT EXISTS route_sequence INTEGER,
  ADD COLUMN IF NOT EXISTS customer_latitude DECIMAL(10,8),
  ADD COLUMN IF NOT EXISTS customer_longitude DECIMAL(11,8);

ALTER TABLE public.delivery_routes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Riders can view own routes" ON public.delivery_routes
  FOR SELECT USING (rider_id = auth.uid());

CREATE POLICY "Admins can manage routes" ON public.delivery_routes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- =============================================
-- 6. ENHANCED AUTO-REPLENISH
-- =============================================

ALTER TABLE public.auto_replenish_items
  ADD COLUMN IF NOT EXISTS reminder_before_days INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS total_orders_created INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_amount_spent DECIMAL(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS pause_until DATE,
  ADD COLUMN IF NOT EXISTS preferred_payment_method TEXT,
  ADD COLUMN IF NOT EXISTS preferred_delivery_option TEXT;

-- =============================================
-- 7. LOYALTY POINTS REDEMPTION ENHANCEMENT
-- =============================================

-- Add wallet credit functionality
ALTER TABLE public.loyalty_redemptions
  ADD COLUMN IF NOT EXISTS wallet_transaction_id UUID REFERENCES public.wallet_transactions(id),
  ADD COLUMN IF NOT EXISTS redemption_type TEXT DEFAULT 'wallet_credit' CHECK (redemption_type IN ('wallet_credit', 'order_discount', 'gift_card'));

-- Function to process loyalty redemption and add to wallet
CREATE OR REPLACE FUNCTION public.process_loyalty_redemption(
  p_user_id UUID,
  p_points INTEGER,
  p_ksh_value DECIMAL
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
BEGIN
  -- Get or create wallet
  SELECT id INTO v_wallet_id FROM wallets WHERE user_id = p_user_id;
  
  IF v_wallet_id IS NULL THEN
    INSERT INTO wallets (user_id, balance) VALUES (p_user_id, 0)
    RETURNING id INTO v_wallet_id;
  END IF;
  
  -- Create wallet transaction
  INSERT INTO wallet_transactions (wallet_id, amount, transaction_type, description)
  VALUES (v_wallet_id, p_ksh_value, 'credit', 'Loyalty points redemption')
  RETURNING id INTO v_transaction_id;
  
  -- Update wallet balance
  UPDATE wallets SET balance = balance + p_ksh_value, updated_at = now()
  WHERE id = v_wallet_id;
  
  -- Deduct points from profile
  UPDATE profiles SET loyalty_points = loyalty_points - p_points, points_last_activity = now()
  WHERE id = p_user_id;
  
  -- Create redemption record
  INSERT INTO loyalty_redemptions (user_id, points_redeemed, ksh_value, wallet_transaction_id, status)
  VALUES (p_user_id, p_points, p_ksh_value, v_transaction_id, 'completed')
  RETURNING id INTO v_redemption_id;
  
  RETURN v_redemption_id;
END;
$$;

-- =============================================
-- 8. TRIGGERS AND INDEXES
-- =============================================

-- Update triggers
CREATE TRIGGER update_role_definitions_updated_at
  BEFORE UPDATE ON public.role_definitions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payment_settings_updated_at
  BEFORE UPDATE ON public.payment_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bnpl_transactions_updated_at
  BEFORE UPDATE ON public.bnpl_transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_delivery_routes_updated_at
  BEFORE UPDATE ON public.delivery_routes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_bnpl_transactions_user ON public.bnpl_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_bnpl_transactions_status ON public.bnpl_transactions(status);
CREATE INDEX IF NOT EXISTS idx_bnpl_installments_due ON public.bnpl_installments(due_date, status);
CREATE INDEX IF NOT EXISTS idx_delivery_routes_rider ON public.delivery_routes(rider_id, date);
CREATE INDEX IF NOT EXISTS idx_food_baskets_shared ON public.food_baskets(is_shared) WHERE is_shared = true;
CREATE INDEX IF NOT EXISTS idx_addresses_location ON public.addresses(latitude, longitude) WHERE latitude IS NOT NULL;
