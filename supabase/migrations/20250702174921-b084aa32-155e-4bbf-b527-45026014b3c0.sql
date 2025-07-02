
-- Create loyalty settings table
CREATE TABLE public.loyalty_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  points_per_ksh NUMERIC NOT NULL DEFAULT 1.0,
  ksh_per_point NUMERIC NOT NULL DEFAULT 1.0,
  min_redemption_points INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create loyalty redemptions table
CREATE TABLE public.loyalty_redemptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  points_redeemed INTEGER NOT NULL,
  ksh_value NUMERIC NOT NULL,
  order_id UUID NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on loyalty tables
ALTER TABLE public.loyalty_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_redemptions ENABLE ROW LEVEL SECURITY;

-- Loyalty settings policies (only admins can manage)
CREATE POLICY "Only admins can view loyalty settings"
  ON public.loyalty_settings
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Only admins can update loyalty settings"
  ON public.loyalty_settings
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Loyalty redemptions policies
CREATE POLICY "Users can view their own redemptions"
  ON public.loyalty_redemptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own redemptions"
  ON public.loyalty_redemptions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all redemptions"
  ON public.loyalty_redemptions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Insert default loyalty settings
INSERT INTO public.loyalty_settings (
  points_per_ksh,
  ksh_per_point,
  min_redemption_points
) VALUES (
  1.0,
  1.0,
  100
);

-- Create trigger for updating loyalty settings updated_at
CREATE OR REPLACE FUNCTION update_loyalty_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_loyalty_settings_updated_at
  BEFORE UPDATE ON public.loyalty_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_loyalty_settings_updated_at();

-- Create trigger for updating loyalty redemptions updated_at
CREATE TRIGGER update_loyalty_redemptions_updated_at
  BEFORE UPDATE ON public.loyalty_redemptions
  FOR EACH ROW
  EXECUTE FUNCTION update_loyalty_settings_updated_at();
