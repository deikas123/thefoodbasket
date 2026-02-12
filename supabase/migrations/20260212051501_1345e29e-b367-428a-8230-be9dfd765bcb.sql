-- Allow anon SELECT on waitlist (needed for upsert conflict detection)
CREATE POLICY "Anon can select waitlist for upsert"
ON public.waitlist
FOR SELECT
TO anon
USING (true);