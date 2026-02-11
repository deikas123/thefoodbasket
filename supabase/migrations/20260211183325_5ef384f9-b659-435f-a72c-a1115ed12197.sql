
-- Add new columns for enhanced waitlist data collection
ALTER TABLE public.waitlist 
  ADD COLUMN IF NOT EXISTS household_size text,
  ADD COLUMN IF NOT EXISTS budget_range text,
  ADD COLUMN IF NOT EXISTS preferred_basket_type text,
  ADD COLUMN IF NOT EXISTS pain_points text[],
  ADD COLUMN IF NOT EXISTS suggestion text;
