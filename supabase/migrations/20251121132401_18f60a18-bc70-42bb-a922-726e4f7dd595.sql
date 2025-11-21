-- Enable RLS on website_sections if not already enabled
ALTER TABLE website_sections ENABLE ROW LEVEL SECURITY;

-- Allow admins to view all website sections
CREATE POLICY "Admins can view all website sections"
ON website_sections
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Allow admins to insert website sections
CREATE POLICY "Admins can insert website sections"
ON website_sections
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Allow admins to update website sections
CREATE POLICY "Admins can update website sections"
ON website_sections
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Allow admins to delete website sections
CREATE POLICY "Admins can delete website sections"
ON website_sections
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Allow public to view active website sections
CREATE POLICY "Public can view active website sections"
ON website_sections
FOR SELECT
TO anon, authenticated
USING (active = true);