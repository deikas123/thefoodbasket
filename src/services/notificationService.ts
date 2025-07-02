
import { supabase } from "@/integrations/supabase/client";
import { Notification } from "@/types/notification";
import { toast } from "sonner";

// Get all notifications (admin)
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

// Create a new notification (admin)
export const createNotification = async (notification: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification | null> => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        title: notification.title,
        body: notification.body,
        image: notification.image,
        link: notification.link,
        status: notification.status,
        scheduled_for: notification.scheduledFor,
        target_user_role: notification.targetUserRole,
        target_user_ids: notification.targetUserIds,
        trigger: notification.trigger,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();
      
    if (error) throw error;
    
    // If notification status is 'sent', send it immediately
    if (notification.status === 'sent') {
      await sendPushNotification(data);
    }
    
    return data;
  } catch (error: any) {
    console.error("Error creating notification:", error.message);
    throw error;
  }
};

// Update a notification (admin)
export const updateNotification = async (id: string, updates: Partial<Notification>): Promise<Notification | null> => {
  try {
    const updateData: any = {};
    
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.body !== undefined) updateData.body = updates.body;
    if (updates.image !== undefined) updateData.image = updates.image;
    if (updates.link !== undefined) updateData.link = updates.link;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.scheduledFor !== undefined) updateData.scheduled_for = updates.scheduledFor;
    if (updates.sentAt !== undefined) updateData.sent_at = updates.sentAt;
    if (updates.targetUserRole !== undefined) updateData.target_user_role = updates.targetUserRole;
    if (updates.targetUserIds !== undefined) updateData.target_user_ids = updates.targetUserIds;
    if (updates.trigger !== undefined) updateData.trigger = updates.trigger;

    const { data, error } = await supabase
      .from('notifications')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error("Error updating notification:", error.message);
    throw error;
  }
};

// Delete a notification (admin)
export const deleteNotification = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    return true;
  } catch (error: any) {
    console.error("Error deleting notification:", error.message);
    throw error;
  }
};

// Send a push notification (admin)
export const sendPushNotification = async (notification: Notification): Promise<boolean> => {
  try {
    console.log("Sending push notification:", notification.title);
    
    // Update the notification status to sent
    const { error } = await supabase
      .from('notifications')
      .update({ 
        status: 'sent',
        sent_at: new Date().toISOString()
      })
      .eq('id', notification.id);
      
    if (error) throw error;
    
    // Here you would typically integrate with a push notification service like:
    // - Firebase Cloud Messaging (FCM)
    // - OneSignal
    // - Pusher
    // - Apple Push Notification Service (APNs)
    
    // For now, we'll simulate the push notification and create customer notifications
    await createCustomerNotifications(notification);
    
    toast.success("Push notification sent successfully!");
    return true;
  } catch (error: any) {
    console.error("Error sending push notification:", error.message);
    toast.error("Failed to send push notification");
    throw error;
  }
};

// Create customer notifications based on target criteria
const createCustomerNotifications = async (notification: Notification) => {
  try {
    // Get target users based on criteria
    let targetUserIds: string[] = [];
    
    if (notification.targetUserIds && notification.targetUserIds.length > 0) {
      targetUserIds = notification.targetUserIds;
    } else if (notification.targetUserRole) {
      // Get users with specific role
      const { data: userRoles, error } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', notification.targetUserRole);
        
      if (error) throw error;
      targetUserIds = userRoles?.map(ur => ur.user_id) || [];
    } else {
      // Get all users
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id');
        
      if (error) throw error;
      targetUserIds = profiles?.map(p => p.id) || [];
    }
    
    // Create customer notifications for each target user
    const customerNotifications = targetUserIds.map(userId => ({
      user_id: userId,
      order_id: '00000000-0000-0000-0000-000000000000', // Default UUID for system notifications
      title: notification.title,
      message: notification.body,
      type: 'system_notification',
      read: false
    }));
    
    if (customerNotifications.length > 0) {
      const { error } = await supabase
        .from('customer_notifications')
        .insert(customerNotifications);
        
      if (error) throw error;
    }
    
    console.log(`Created ${customerNotifications.length} customer notifications`);
  } catch (error: any) {
    console.error("Error creating customer notifications:", error.message);
  }
};

// Send notification to specific user
export const sendNotificationToUser = async (userId: string, notification: Omit<Notification, 'id' | 'createdAt'>) => {
  try {
    // Create a targeted notification
    const targetedNotification = await createNotification({
      ...notification,
      targetUserIds: [userId],
      status: 'sent'
    });
    
    return targetedNotification;
  } catch (error: any) {
    console.error("Error sending notification to user:", error.message);
    throw error;
  }
};

// Get notifications for a specific user (for the notification menu)
export const getUserNotifications = async (userId: string): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('customer_notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);
      
    if (error) throw error;
    return data || [];
  } catch (error: any) {
    console.error("Error fetching user notifications:", error.message);
    return [];
  }
};

// Mark customer notification as read
export const markCustomerNotificationAsRead = async (notificationId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('customer_notifications')
      .update({ read: true })
      .eq('id', notificationId);
      
    if (error) throw error;
  } catch (error: any) {
    console.error("Error marking notification as read:", error.message);
    throw error;
  }
};
