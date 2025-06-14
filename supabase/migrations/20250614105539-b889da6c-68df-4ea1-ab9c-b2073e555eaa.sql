
-- Create delivery_options table
CREATE TABLE public.delivery_options (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  base_price NUMERIC NOT NULL DEFAULT 0,
  price_per_km NUMERIC,
  estimated_delivery_days INTEGER NOT NULL DEFAULT 1,
  is_express BOOLEAN NOT NULL DEFAULT false,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add some sample delivery options
INSERT INTO public.delivery_options (name, description, base_price, price_per_km, estimated_delivery_days, is_express, active) VALUES
('Standard Delivery', 'Regular delivery service', 5.99, 1.50, 3, false, true),
('Express Delivery', 'Fast delivery service', 12.99, 2.00, 1, true, true),
('Economy Delivery', 'Budget-friendly delivery', 2.99, 1.00, 5, false, true);

-- Add trigger for updated_at
CREATE TRIGGER update_delivery_options_updated_at
  BEFORE UPDATE ON public.delivery_options
  FOR EACH ROW
  EXECUTE FUNCTION public.update_modified_column();
