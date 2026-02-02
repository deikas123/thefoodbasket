-- Allow anyone to update their waitlist entry (for re-registration)
CREATE POLICY "Anyone can update their waitlist entry"
ON public.waitlist
FOR UPDATE
USING (true)
WITH CHECK (true);