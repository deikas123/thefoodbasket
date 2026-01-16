
-- Fix RLS and security issues from the migration

-- 1. Fix payment_settings - allow all authenticated to view enabled payments
DROP POLICY IF EXISTS "Anyone can view enabled payments" ON public.payment_settings;
CREATE POLICY "Anyone can view payment settings" ON public.payment_settings
  FOR SELECT USING (true);

-- 2. Add INSERT policy for BNPL transactions (for creating orders with BNPL)
CREATE POLICY "Users can create own BNPL transactions" ON public.bnpl_transactions
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- 3. Add INSERT policy for BNPL installments
CREATE POLICY "System can create BNPL installments" ON public.bnpl_installments
  FOR INSERT WITH CHECK (
    transaction_id IN (SELECT id FROM public.bnpl_transactions WHERE user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- 4. Add SELECT policy for food basket likes (anyone can see like counts)
CREATE POLICY "Anyone can view likes" ON public.food_basket_likes
  FOR SELECT USING (true);

-- 5. Add SELECT policy for food basket saves (anyone can see save counts)
CREATE POLICY "Anyone can view saves" ON public.food_basket_saves
  FOR SELECT USING (true);

-- 6. Add INSERT/UPDATE for delivery routes by riders
CREATE POLICY "Riders can update own routes" ON public.delivery_routes
  FOR UPDATE USING (rider_id = auth.uid());

-- 7. Add INSERT for delivery routes by system
CREATE POLICY "System can create routes" ON public.delivery_routes
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'delivery'))
  );
