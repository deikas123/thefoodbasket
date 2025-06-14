
-- First, let's drop all existing policies for the products bucket
DROP POLICY IF EXISTS "Allow public access to products bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to products bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow uploads to products bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow updates to products bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow deletes from products bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload to products bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update products bucket files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete products bucket files" ON storage.objects;

-- Create simple, permissive policies for the products bucket
CREATE POLICY "products_bucket_select_policy" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'products');

CREATE POLICY "products_bucket_insert_policy" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'products');

CREATE POLICY "products_bucket_update_policy" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'products');

CREATE POLICY "products_bucket_delete_policy" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'products');
