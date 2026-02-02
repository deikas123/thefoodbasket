-- Allow anonymous users to insert and update waitlist entries (for public signup & re-registration)
CREATE POLICY "Anon can insert waitlist"
ON public.waitlist
FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Anon can update waitlist"
ON public.waitlist
FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);