-- Enable RLS on user_roles table (critical security issue)
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Allow admins to manage all roles
CREATE POLICY "Admins can manage user roles"
ON public.user_roles
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
);

-- Allow users to view their own role
CREATE POLICY "Users can view their own role"
ON public.user_roles
FOR SELECT
USING (user_id = auth.uid());