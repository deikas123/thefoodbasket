
-- Update the check constraint to allow 'delivery_settings' type
ALTER TABLE website_sections DROP CONSTRAINT IF EXISTS website_sections_type_check;

ALTER TABLE website_sections ADD CONSTRAINT website_sections_type_check 
CHECK (type IN ('banner', 'hero', 'featured', 'deals', 'info', 'category', 'testimonial', 'delivery_settings'));
