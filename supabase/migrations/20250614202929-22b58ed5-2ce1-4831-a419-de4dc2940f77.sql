
-- Only add the INSERT policy which is the critical one missing
CREATE POLICY "Users can insert their own KYC verification" 
ON public.kyc_verifications 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);
