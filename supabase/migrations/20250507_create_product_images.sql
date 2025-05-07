
-- Create product_images table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add RLS policies
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view product images
CREATE POLICY "Allow anyone to view product images" 
ON public.product_images FOR SELECT 
USING (true);

-- Allow authenticated users to manage product images
CREATE POLICY "Allow authenticated users to insert product images" 
ON public.product_images FOR INSERT
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update product images" 
ON public.product_images FOR UPDATE
TO authenticated 
USING (true);

CREATE POLICY "Allow authenticated users to delete product images" 
ON public.product_images FOR DELETE
TO authenticated 
USING (true);
