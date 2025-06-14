
-- Add the new 'order_fulfillment' role to the user_roles table
-- Since we're using text type for roles, we just need to ensure the application code recognizes it
-- No schema changes needed, just adding the role to the application logic

-- Create a simple table to track chat conversations between customers and customer service
CREATE TABLE public.customer_chats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_service_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'open', -- 'open', 'assigned', 'resolved'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create a table for chat messages
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID NOT NULL REFERENCES public.customer_chats(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  sender_type TEXT NOT NULL, -- 'customer' or 'agent'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.customer_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for customer_chats
CREATE POLICY "Customers can view their own chats"
  ON public.customer_chats
  FOR SELECT
  USING (customer_id = auth.uid());

CREATE POLICY "Customer service can view assigned chats"
  ON public.customer_chats
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'customer_service'
    )
  );

CREATE POLICY "Customers can create chats"
  ON public.customer_chats
  FOR INSERT
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Customer service can update chats"
  ON public.customer_chats
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'customer_service'
    )
  );

-- RLS policies for chat_messages
CREATE POLICY "Users can view messages in their chats"
  ON public.chat_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.customer_chats 
      WHERE id = chat_id 
      AND (customer_id = auth.uid() OR customer_service_id = auth.uid())
    )
    OR
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'customer_service'
    )
  );

CREATE POLICY "Users can insert messages in their chats"
  ON public.chat_messages
  FOR INSERT
  WITH CHECK (
    sender_id = auth.uid() AND
    (
      EXISTS (
        SELECT 1 FROM public.customer_chats 
        WHERE id = chat_id 
        AND (customer_id = auth.uid() OR customer_service_id = auth.uid())
      )
      OR
      EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() 
        AND role = 'customer_service'
      )
    )
  );
