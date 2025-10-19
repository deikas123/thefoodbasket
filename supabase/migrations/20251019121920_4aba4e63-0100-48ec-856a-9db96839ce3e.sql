-- Add brand_name and weight columns to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS brand_name TEXT,
ADD COLUMN IF NOT EXISTS weight TEXT;

-- Add comment for clarity
COMMENT ON COLUMN public.products.brand_name IS 'Brand name of the product';
COMMENT ON COLUMN public.products.weight IS 'Weight or size of the product (e.g., 2kg, 500g, 1L)';