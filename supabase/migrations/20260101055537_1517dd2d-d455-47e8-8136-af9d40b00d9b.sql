-- Drop the old check constraint and add a new one that includes 'homepage_mode'
ALTER TABLE public.website_sections DROP CONSTRAINT IF EXISTS website_sections_type_check;

ALTER TABLE public.website_sections ADD CONSTRAINT website_sections_type_check 
CHECK (type = ANY (ARRAY['banner'::text, 'hero'::text, 'featured'::text, 'deals'::text, 'info'::text, 'category'::text, 'testimonial'::text, 'delivery_settings'::text, 'homepage_mode'::text]));