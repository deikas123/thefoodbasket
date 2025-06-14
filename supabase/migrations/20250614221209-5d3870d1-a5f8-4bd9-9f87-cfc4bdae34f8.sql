
-- Create a table for loyalty point settings
CREATE TABLE public.loyalty_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  points_per_ksh numeric NOT NULL DEFAULT 1.0,
  ksh_per_point numeric NOT NULL DEFAULT 1.0,
  min_redemption_points integer NOT NULL DEFAULT 100,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Insert default settings
INSERT INTO public.loyalty_settings (points_per_ksh, ksh_per_point, min_redemption_points)
VALUES (1.0, 1.0, 100);

-- Create a table for loyalty point redemptions
CREATE TABLE public.loyalty_redemptions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  points_redeemed integer NOT NULL,
  ksh_value numeric NOT NULL,
  order_id uuid,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on loyalty tables
ALTER TABLE public.loyalty_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_redemptions ENABLE ROW LEVEL SECURITY;

-- RLS policies for loyalty_settings (admin access only)
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

-- RLS policies for loyalty_redemptions
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

-- Create storage bucket for category images
INSERT INTO storage.buckets (id, name, public)
VALUES ('category-images', 'category-images', true);

-- Storage policies for category images
CREATE POLICY "Anyone can view category images"
ON storage.objects FOR SELECT
USING (bucket_id = 'category-images');

CREATE POLICY "Admins can upload category images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'category-images' AND
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can update category images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'category-images' AND
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can delete category images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'category-images' AND
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);
