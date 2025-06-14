
import { supabase } from "@/integrations/supabase/client";

export interface ChatMessage {
  id: string;
  chat_id: string;
  sender_id: string;
  message: string;
  sender_type: 'customer' | 'agent';
  created_at: string;
}

export interface CustomerChat {
  id: string;
  customer_id: string;
  customer_service_id?: string;
  status: 'open' | 'assigned' | 'resolved';
  created_at: string;
  updated_at: string;
}

export const createChat = async (message: string): Promise<string> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Create chat
  const { data: chat, error: chatError } = await supabase
    .from('customer_chats')
    .insert({
      customer_id: user.id,
      status: 'open'
    })
    .select()
    .single();

  if (chatError) throw chatError;

  // Send initial message
  const { error: messageError } = await supabase
    .from('chat_messages')
    .insert({
      chat_id: chat.id,
      sender_id: user.id,
      message,
      sender_type: 'customer'
    });

  if (messageError) throw messageError;

  return chat.id;
};

export const sendMessage = async (chatId: string, message: string, senderType: 'customer' | 'agent'): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from('chat_messages')
    .insert({
      chat_id: chatId,
      sender_id: user.id,
      message,
      sender_type: senderType
    });

  if (error) throw error;

  // Update chat timestamp
  await supabase
    .from('customer_chats')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', chatId);
};

export const getChatMessages = async (chatId: string): Promise<ChatMessage[]> => {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
};

export const getUserChats = async (): Promise<CustomerChat[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from('customer_chats')
    .select('*')
    .eq('customer_id', user.id)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data || [];
};
