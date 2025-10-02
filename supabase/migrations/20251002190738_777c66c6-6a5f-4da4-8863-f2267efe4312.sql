-- Add unit field to products table
ALTER TABLE public.products 
ADD COLUMN unit text DEFAULT 'piece' CHECK (unit IN ('piece', 'kg', 'g', 'bunch', 'pack', 'liter', 'ml'));

COMMENT ON COLUMN public.products.unit IS 'Measurement unit for the product (piece, kg, g, bunch, pack, liter, ml)';