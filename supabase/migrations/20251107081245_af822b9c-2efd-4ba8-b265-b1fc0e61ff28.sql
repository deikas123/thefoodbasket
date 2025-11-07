-- Create receipts table for tracking
CREATE TABLE IF NOT EXISTS public.receipts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid NOT NULL,
  user_id uuid NOT NULL,
  receipt_number text NOT NULL UNIQUE,
  total_amount numeric NOT NULL,
  sent_at timestamp with time zone,
  email_sent_to text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;

-- Users can view their own receipts
CREATE POLICY "Users can view their own receipts"
  ON public.receipts
  FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all receipts
CREATE POLICY "Admins can view all receipts"
  ON public.receipts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- System can insert receipts
CREATE POLICY "System can insert receipts"
  ON public.receipts
  FOR INSERT
  WITH CHECK (true);

-- Add index for faster lookups
CREATE INDEX idx_receipts_order_id ON public.receipts(order_id);
CREATE INDEX idx_receipts_user_id ON public.receipts(user_id);
CREATE INDEX idx_receipts_receipt_number ON public.receipts(receipt_number);

-- Add comment
COMMENT ON TABLE public.receipts IS 'Tracks receipt generation and sending for orders';