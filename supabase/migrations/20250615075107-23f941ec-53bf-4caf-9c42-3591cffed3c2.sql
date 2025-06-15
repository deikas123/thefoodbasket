
-- Create functions to handle delivery settings without RLS conflicts
CREATE OR REPLACE FUNCTION public.get_delivery_settings()
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT settings 
  FROM website_sections 
  WHERE type = 'delivery_settings' 
  AND name = 'delivery_settings'
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.upsert_delivery_settings(settings_data jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  existing_id uuid;
  result_data jsonb;
BEGIN
  -- Check if record exists
  SELECT id INTO existing_id
  FROM website_sections 
  WHERE type = 'delivery_settings' 
  AND name = 'delivery_settings'
  LIMIT 1;
  
  IF existing_id IS NOT NULL THEN
    -- Update existing record
    UPDATE website_sections 
    SET 
      settings = settings_data,
      updated_at = now()
    WHERE id = existing_id;
    
    SELECT settings INTO result_data
    FROM website_sections 
    WHERE id = existing_id;
  ELSE
    -- Insert new record
    INSERT INTO website_sections (
      name, 
      type, 
      title, 
      settings, 
      position, 
      active
    ) VALUES (
      'delivery_settings',
      'delivery_settings', 
      'Delivery Settings',
      settings_data,
      1,
      true
    );
    
    result_data := settings_data;
  END IF;
  
  RETURN result_data;
END;
$$;
