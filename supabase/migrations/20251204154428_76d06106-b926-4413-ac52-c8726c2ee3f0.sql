-- Add tier columns to loyalty_settings
ALTER TABLE public.loyalty_settings 
ADD COLUMN IF NOT EXISTS bronze_threshold integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS silver_threshold integer NOT NULL DEFAULT 500,
ADD COLUMN IF NOT EXISTS gold_threshold integer NOT NULL DEFAULT 2000,
ADD COLUMN IF NOT EXISTS bronze_multiplier numeric NOT NULL DEFAULT 1.0,
ADD COLUMN IF NOT EXISTS silver_multiplier numeric NOT NULL DEFAULT 1.5,
ADD COLUMN IF NOT EXISTS gold_multiplier numeric NOT NULL DEFAULT 2.0;

-- Update the existing row with default values if it exists
UPDATE public.loyalty_settings SET
  bronze_threshold = COALESCE(bronze_threshold, 0),
  silver_threshold = COALESCE(silver_threshold, 500),
  gold_threshold = COALESCE(gold_threshold, 2000),
  bronze_multiplier = COALESCE(bronze_multiplier, 1.0),
  silver_multiplier = COALESCE(silver_multiplier, 1.5),
  gold_multiplier = COALESCE(gold_multiplier, 2.0);