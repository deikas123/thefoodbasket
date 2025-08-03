-- Create function to atomically deduct product stock
CREATE OR REPLACE FUNCTION public.deduct_product_stock(
  product_id uuid,
  quantity_to_deduct integer
) RETURNS void AS $$
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
$$ LANGUAGE plpgsql;