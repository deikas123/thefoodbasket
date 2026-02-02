-- Add email_sent tracking column to waitlist table
ALTER TABLE public.waitlist 
ADD COLUMN IF NOT EXISTS email_sent boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS email_sent_at timestamp with time zone DEFAULT NULL;

-- Create index for efficient querying of unsent emails
CREATE INDEX IF NOT EXISTS idx_waitlist_email_sent ON public.waitlist(email_sent) WHERE email_sent = false;