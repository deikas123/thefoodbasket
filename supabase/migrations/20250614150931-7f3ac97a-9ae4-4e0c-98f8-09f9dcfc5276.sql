
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Allow anyone to view products bucket files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload to products bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update products bucket files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete products bucket files" ON storage.objects;

-- Create more permissive policies that allow uploads without authentication issues
CREATE POLICY "Allow public read access to products bucket" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'products');

CREATE POLICY "Allow uploads to products bucket" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'products');

CREATE POLICY "Allow updates to products bucket" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'products');

CREATE POLICY "Allow deletes from products bucket" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'products');
