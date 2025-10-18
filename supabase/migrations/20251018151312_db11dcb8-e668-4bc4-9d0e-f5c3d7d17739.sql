-- Add notification preferences columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS notification_order_email boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS notification_order_sms boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS notification_promo_email boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS notification_promo_sms boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS notification_product_email boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS notification_product_sms boolean DEFAULT false;