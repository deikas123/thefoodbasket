-- Enable admins to manage food baskets and items
-- This allows the AI-generated baskets to be saved and admins to manage baskets

-- Update RLS policies for food_baskets table
DROP POLICY IF EXISTS "Food baskets are publicly viewable" ON food_baskets;

CREATE POLICY "Food baskets are publicly viewable" 
ON food_baskets 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can insert food baskets" 
ON food_baskets 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
  )
);

CREATE POLICY "Admins can update food baskets" 
ON food_baskets 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
  )
);

CREATE POLICY "Admins can delete food baskets" 
ON food_baskets 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
  )
);

-- Update RLS policies for food_basket_items table
DROP POLICY IF EXISTS "Food basket items are publicly viewable" ON food_basket_items;

CREATE POLICY "Food basket items are publicly viewable" 
ON food_basket_items 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can insert food basket items" 
ON food_basket_items 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
  )
);

CREATE POLICY "Admins can update food basket items" 
ON food_basket_items 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
  )
);

CREATE POLICY "Admins can delete food basket items" 
ON food_basket_items 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
  )
);

-- Add user_id column to food_baskets to track who created it
ALTER TABLE food_baskets ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- Allow authenticated users to save their own AI-generated baskets
CREATE POLICY "Users can insert their own food baskets" 
ON food_baskets 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own food baskets" 
ON food_baskets 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own food baskets" 
ON food_baskets 
FOR DELETE 
USING (auth.uid() = user_id);

-- Allow users to manage items for their own baskets
CREATE POLICY "Users can insert items for their own baskets" 
ON food_basket_items 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM food_baskets 
    WHERE food_baskets.id = food_basket_items.basket_id 
    AND food_baskets.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update items for their own baskets" 
ON food_basket_items 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM food_baskets 
    WHERE food_baskets.id = food_basket_items.basket_id 
    AND food_baskets.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete items for their own baskets" 
ON food_basket_items 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM food_baskets 
    WHERE food_baskets.id = food_basket_items.basket_id 
    AND food_baskets.user_id = auth.uid()
  )
);