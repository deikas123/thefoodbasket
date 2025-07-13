-- Add RLS policy for admins to view all auto replenish items
CREATE POLICY "Admins can view all auto replenish items" 
ON auto_replenish_items 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_roles.user_id = auth.uid() 
  AND user_roles.role = 'admin'
));