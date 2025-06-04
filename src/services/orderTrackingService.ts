
import { supabase } from "@/integrations/supabase/client";

export interface OrderTrackingEvent {
  id: string;
  order_id: string;
  status: string;
  timestamp: string;
  description: string;
  location?: string;
  created_by?: string;
  created_at: string;
}

export interface CustomerNotification {
  id: string;
  user_id: string;
  order_id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
}

export const getOrderTrackingEvents = async (orderId: string): Promise<OrderTrackingEvent[]> => {
  const { data, error } = await supabase
    .from('order_tracking_events')
    .select('*')
    .eq('order_id', orderId)
    .order('timestamp', { ascending: true });
    
  if (error) {
    console.error("Error fetching tracking events:", error);
    throw error;
  }
  
  return data || [];
};

export const addTrackingEvent = async (
  orderId: string, 
  status: string, 
  description: string, 
  location?: string
): Promise<OrderTrackingEvent> => {
  const { data, error } = await supabase
    .from('order_tracking_events')
    .insert({
      order_id: orderId,
      status,
      description,
      location
    })
    .select()
    .single();
    
  if (error) {
    console.error("Error adding tracking event:", error);
    throw error;
  }
  
  return data;
};

export const getUserNotifications = async (userId: string): Promise<CustomerNotification[]> => {
  const { data, error } = await supabase
    .from('customer_notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
  
  return data || [];
};

export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  const { error } = await supabase
    .from('customer_notifications')
    .update({ read: true })
    .eq('id', notificationId);
    
  if (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};
