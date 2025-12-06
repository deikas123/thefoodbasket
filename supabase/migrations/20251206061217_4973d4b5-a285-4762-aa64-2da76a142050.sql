-- Drop the problematic policy that references auth.users directly
DROP POLICY IF EXISTS "Admins can manage sections" ON public.website_sections;