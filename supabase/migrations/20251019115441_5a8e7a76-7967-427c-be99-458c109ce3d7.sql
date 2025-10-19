-- Create stores table
CREATE TABLE public.stores (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  logo text,
  address text,
  phone text,
  email text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;

-- Create store_admins table to map admins to stores
CREATE TABLE public.store_admins (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(store_id, user_id)
);

-- Enable RLS
ALTER TABLE public.store_admins ENABLE ROW LEVEL SECURITY;

-- Add store_id to products
ALTER TABLE public.products ADD COLUMN store_id uuid REFERENCES public.stores(id) ON DELETE CASCADE;

-- Add store_id to categories
ALTER TABLE public.categories ADD COLUMN store_id uuid REFERENCES public.stores(id) ON DELETE CASCADE;

-- Add store_id to banners
ALTER TABLE public.banners ADD COLUMN store_id uuid REFERENCES public.stores(id) ON DELETE CASCADE;

-- Add store_id to daily_offers
ALTER TABLE public.daily_offers ADD COLUMN store_id uuid REFERENCES public.stores(id) ON DELETE CASCADE;

-- Add store_id to orders
ALTER TABLE public.orders ADD COLUMN store_id uuid REFERENCES public.stores(id) ON DELETE SET NULL;

-- RLS Policies for stores
CREATE POLICY "Active stores are viewable by everyone"
ON public.stores FOR SELECT
USING (active = true);

CREATE POLICY "Admins can manage all stores"
ON public.stores FOR ALL
USING (EXISTS (
  SELECT 1 FROM user_roles
  WHERE user_roles.user_id = auth.uid()
  AND user_roles.role = 'admin'
));

-- RLS Policies for store_admins
CREATE POLICY "Store admins can view their assignments"
ON public.store_admins FOR SELECT
USING (user_id = auth.uid() OR EXISTS (
  SELECT 1 FROM user_roles
  WHERE user_roles.user_id = auth.uid()
  AND user_roles.role = 'admin'
));

CREATE POLICY "Admins can manage store assignments"
ON public.store_admins FOR ALL
USING (EXISTS (
  SELECT 1 FROM user_roles
  WHERE user_roles.user_id = auth.uid()
  AND user_roles.role = 'admin'
));

-- Update existing RLS policies to include store filtering
DROP POLICY IF EXISTS "Products are viewable by everyone" ON public.products;
CREATE POLICY "Products are viewable by everyone"
ON public.products FOR SELECT
USING (store_id IS NULL OR EXISTS (
  SELECT 1 FROM stores WHERE stores.id = products.store_id AND stores.active = true
));

DROP POLICY IF EXISTS "Categories are viewable by everyone" ON public.categories;
CREATE POLICY "Categories are viewable by everyone"
ON public.categories FOR SELECT
USING (store_id IS NULL OR EXISTS (
  SELECT 1 FROM stores WHERE stores.id = categories.store_id AND stores.active = true
));

DROP POLICY IF EXISTS "Active banners are viewable by everyone" ON public.banners;
CREATE POLICY "Active banners are viewable by everyone"
ON public.banners FOR SELECT
USING (active = true AND (now() >= start_date AND now() <= end_date) AND (store_id IS NULL OR EXISTS (
  SELECT 1 FROM stores WHERE stores.id = banners.store_id AND stores.active = true
)));

DROP POLICY IF EXISTS "Active daily offers are viewable by everyone" ON public.daily_offers;
CREATE POLICY "Active daily offers are viewable by everyone"
ON public.daily_offers FOR SELECT
USING (active = true AND (now() >= start_date AND now() <= end_date) AND (store_id IS NULL OR EXISTS (
  SELECT 1 FROM stores WHERE stores.id = daily_offers.store_id AND stores.active = true
)));

-- Create trigger for updated_at
CREATE TRIGGER update_stores_updated_at
BEFORE UPDATE ON public.stores
FOR EACH ROW
EXECUTE FUNCTION public.update_modified_column();