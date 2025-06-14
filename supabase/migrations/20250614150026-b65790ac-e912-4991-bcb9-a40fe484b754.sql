
-- Fix the user_roles table constraint issue by handling duplicates gracefully
-- Drop the existing constraint if it exists
ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS unique_user_role;

-- Add a proper unique constraint that prevents duplicate user-role combinations
ALTER TABLE user_roles ADD CONSTRAINT unique_user_role UNIQUE (user_id, role);

-- Update RLS policies for the existing products bucket to be more permissive
DROP POLICY IF EXISTS "Allow public uploads to products bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow public access to products bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update products bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete from products bucket" ON storage.objects;

-- Create new, more permissive policies for the products bucket
CREATE POLICY "Allow anyone to view products bucket files" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'products');

CREATE POLICY "Allow authenticated users to upload to products bucket" 
ON storage.objects FOR INSERT 
TO authenticated
WITH CHECK (bucket_id = 'products');

CREATE POLICY "Allow authenticated users to update products bucket files" 
ON storage.objects FOR UPDATE 
TO authenticated
USING (bucket_id = 'products');

CREATE POLICY "Allow authenticated users to delete products bucket files" 
ON storage.objects FOR DELETE 
TO authenticated
USING (bucket_id = 'products');
