-- Fix website_sections RLS for admin homepage mode switching
CREATE POLICY "Admins can manage website sections" 
ON public.website_sections 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_roles.user_id = auth.uid() 
  AND user_roles.role = 'admin'
))
WITH CHECK (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_roles.user_id = auth.uid() 
  AND user_roles.role = 'admin'
));

-- Allow everyone to read website sections (for homepage mode detection)
CREATE POLICY "Website sections are viewable by everyone" 
ON public.website_sections 
FOR SELECT 
USING (true);

-- Allow authenticated users to view loyalty settings (customers need this)
CREATE POLICY "Authenticated users can view loyalty settings" 
ON public.loyalty_settings 
FOR SELECT 
USING (auth.uid() IS NOT NULL);