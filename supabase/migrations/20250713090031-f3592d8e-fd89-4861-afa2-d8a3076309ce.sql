-- Create customer service chat system tables

-- Customer chats table (already exists, just need to verify structure)
-- This stores chat sessions between customers and agents

-- Chat messages table (already exists, just need to verify structure)
-- This stores individual messages within chats

-- Add customer service role if not exists
INSERT INTO user_roles (user_id, role) 
SELECT id, 'customer_service' 
FROM auth.users 
WHERE email = 'admin@foodbasket.com' 
AND NOT EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.users.id AND role = 'customer_service'
);

-- Add RLS policies for customer service agents
CREATE POLICY "Customer service can view all chats" 
ON customer_chats 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_roles.user_id = auth.uid() 
  AND user_roles.role = 'customer_service'
));

CREATE POLICY "Customer service can insert messages" 
ON chat_messages 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_roles.user_id = auth.uid() 
  AND user_roles.role = 'customer_service'
));

-- Admins can manage customer service agents
CREATE POLICY "Admins can manage all user roles" 
ON user_roles 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_roles.user_id = auth.uid() 
  AND user_roles.role = 'admin'
));