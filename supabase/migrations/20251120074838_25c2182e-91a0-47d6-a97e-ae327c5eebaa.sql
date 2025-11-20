-- Add new fields to waitlist table
ALTER TABLE public.waitlist
ADD COLUMN location TEXT,
ADD COLUMN referral_source TEXT,
ADD COLUMN interests TEXT[] DEFAULT '{}',
ADD COLUMN product_types TEXT[] DEFAULT '{}',
ADD COLUMN shopping_frequency TEXT,
ADD COLUMN preferred_delivery_time TEXT,
ADD COLUMN grocery_challenges TEXT,
ADD COLUMN value_proposition TEXT,
ADD COLUMN wants_early_access BOOLEAN DEFAULT true,
ADD COLUMN wants_beta_testing BOOLEAN DEFAULT false;