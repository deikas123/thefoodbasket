-- Add parent_id column to categories table for subcategories
ALTER TABLE categories ADD COLUMN parent_id uuid REFERENCES categories(id) ON DELETE CASCADE;

-- Add index for better performance when querying subcategories
CREATE INDEX idx_categories_parent_id ON categories(parent_id);

-- Update RLS policies to ensure proper access to subcategories
-- The existing policies should already cover this, but let's make sure