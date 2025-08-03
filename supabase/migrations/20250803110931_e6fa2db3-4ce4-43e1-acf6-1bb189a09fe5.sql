-- Fix security issues: Enable RLS on delivery_options table
ALTER TABLE public.delivery_options ENABLE ROW LEVEL SECURITY;

-- Create policies for delivery_options
CREATE POLICY "Delivery options are viewable by everyone" 
ON public.delivery_options 
FOR SELECT 
USING (active = true);

CREATE POLICY "Admins can manage delivery options" 
ON public.delivery_options 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
))
WITH CHECK (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- Update the function with secure search path
CREATE OR REPLACE FUNCTION public.deduct_product_stock(
  product_id uuid,
  quantity_to_deduct integer
) RETURNS void 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if sufficient stock exists and update in one atomic operation
  UPDATE public.products 
  SET stock = stock - quantity_to_deduct
  WHERE id = product_id AND stock >= quantity_to_deduct;
  
  -- If no rows were updated, it means insufficient stock
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient stock for product %', product_id;
  END IF;
END;
$$;