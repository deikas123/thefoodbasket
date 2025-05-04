
import { supabase } from "@/integrations/supabase/client";
import { Notification } from "@/types/notification";
import { toast } from "sonner";

// Get all notifications
export const getNotifications = async (): Promise<Notification[]> => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data || [];
  } catch (error: any) {
    console.error("Error fetching notifications:", error.message);
    return [];
  }
};

// Create a new notification
export const createNotification = async (notification: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification | null> => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        ...notification,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();
      
    if (error) throw error;
    
    // If notification is not scheduled or triggered, send it immediately
    if (notification.status === 'sent') {
      await sendPushNotification(data);
    }
    
    toast.success("Notification created successfully");
    return data;
  } catch (error: any) {
    toast.error(`Error creating notification: ${error.message}`);
    return null;
  }
};

// Update a notification
export const updateNotification = async (id: string, updates: Partial<Notification>): Promise<Notification | null> => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    
    toast.success("Notification updated successfully");
    return data;
  } catch (error: any) {
    toast.error(`Error updating notification: ${error.message}`);
    return null;
  }
};

// Delete a notification
export const deleteNotification = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    
    toast.success("Notification deleted successfully");
    return true;
  } catch (error: any) {
    toast.error(`Error deleting notification: ${error.message}`);
    return false;
  }
};

// Send a push notification
export const sendPushNotification = async (notification: Notification): Promise<boolean> => {
  try {
    // In a real application, this would call a serverless function to send the push notification
    // Here we're simulating the sending process
    
    // Update notification status to sent
    const { error } = await supabase
      .from('notifications')
      .update({ 
        status: 'sent',
        sent_at: new Date().toISOString()
      })
      .eq('id', notification.id);
      
    if (error) throw error;
    
    toast.success("Notification sent successfully");
    return true;
  } catch (error: any) {
    toast.error(`Error sending notification: ${error.message}`);
    return false;
  }
};
