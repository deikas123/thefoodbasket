-- Add assigned_to field to orders table to track staff assignment
ALTER TABLE orders ADD COLUMN IF NOT EXISTS assigned_to uuid REFERENCES auth.users(id);

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_assigned_to ON orders(assigned_to);