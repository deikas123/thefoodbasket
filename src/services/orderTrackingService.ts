
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/types/database.types";

export interface OrderTrackingEvent {
  id: string;
  order_id: string;
  status: string;
  timestamp: string;
  description: string;
  location?: string;
  location_type?: 'warehouse' | 'transit' | 'delivery' | 'customer';
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

// Predefined tracking locations for the order flow
export const TRACKING_LOCATIONS = {
  MAIN_WAREHOUSE: "Main Warehouse - Kikuyu",
  SORTING_CENTER: "Sorting Center - Westlands",
  REGIONAL_HUB_RUIRU: "Regional Hub - Ruiru",
  REGIONAL_HUB_THIKA: "Regional Hub - Thika",
  REGIONAL_HUB_KAREN: "Regional Hub - Karen",
  REGIONAL_HUB_KIAMBU: "Regional Hub - Kiambu",
  LOCAL_DISPATCH: "Local Dispatch Center",
  EN_ROUTE: "En Route to Customer",
  DELIVERED: "Customer Location"
};

// Tracking event templates for consistent messaging
export const TRACKING_TEMPLATES = {
  ORDER_RECEIVED: {
    status: "pending",
    description: "Order received and confirmed",
    location: TRACKING_LOCATIONS.MAIN_WAREHOUSE,
    location_type: "warehouse" as const
  },
  PACKING_STARTED: {
    status: "processing",
    description: "Order is being prepared and packed",
    location: TRACKING_LOCATIONS.MAIN_WAREHOUSE,
    location_type: "warehouse" as const
  },
  PACKING_COMPLETED: {
    status: "processing",
    description: "Order has been packed and quality checked",
    location: TRACKING_LOCATIONS.MAIN_WAREHOUSE,
    location_type: "warehouse" as const
  },
  DISPATCHED_WAREHOUSE: {
    status: "dispatched",
    description: "Order has left the warehouse",
    location: TRACKING_LOCATIONS.MAIN_WAREHOUSE,
    location_type: "warehouse" as const
  },
  ARRIVED_SORTING: {
    status: "dispatched",
    description: "Order arrived at sorting center",
    location: TRACKING_LOCATIONS.SORTING_CENTER,
    location_type: "transit" as const
  },
  LEFT_SORTING: {
    status: "dispatched",
    description: "Order departed sorting center",
    location: TRACKING_LOCATIONS.SORTING_CENTER,
    location_type: "transit" as const
  },
  ARRIVED_REGIONAL: (hub: string) => ({
    status: "dispatched",
    description: `Order arrived at regional hub`,
    location: hub,
    location_type: "transit" as const
  }),
  LEFT_REGIONAL: (hub: string) => ({
    status: "dispatched",
    description: `Order departed regional hub`,
    location: hub,
    location_type: "transit" as const
  }),
  OUT_FOR_DELIVERY: {
    status: "out_for_delivery",
    description: "Order is out for delivery",
    location: TRACKING_LOCATIONS.EN_ROUTE,
    location_type: "delivery" as const
  },
  DELIVERY_ATTEMPTED: {
    status: "out_for_delivery",
    description: "Delivery attempted - customer unavailable",
    location_type: "customer" as const
  },
  DELIVERED: {
    status: "delivered",
    description: "Order successfully delivered",
    location: TRACKING_LOCATIONS.DELIVERED,
    location_type: "customer" as const
  }
};

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
  location?: string,
  locationType?: 'warehouse' | 'transit' | 'delivery' | 'customer'
): Promise<OrderTrackingEvent> => {
  const { data, error } = await supabase
    .from('order_tracking_events')
    .insert({
      order_id: orderId,
      status,
      description,
      location,
      location_type: locationType
    })
    .select()
    .single();
    
  if (error) {
    console.error("Error adding tracking event:", error);
    throw error;
  }
  
  return data;
};

// Add multiple tracking events at once (for simulating transit)
export const addBulkTrackingEvents = async (
  orderId: string,
  events: Array<{
    status: string;
    description: string;
    location?: string;
    location_type?: string;
    timestamp?: string;
  }>
): Promise<OrderTrackingEvent[]> => {
  const eventsWithOrderId = events.map((event, index) => ({
    order_id: orderId,
    status: event.status,
    description: event.description,
    location: event.location,
    location_type: event.location_type,
    timestamp: event.timestamp || new Date(Date.now() + index * 60000).toISOString() // 1 min apart
  }));

  const { data, error } = await supabase
    .from('order_tracking_events')
    .insert(eventsWithOrderId)
    .select();
    
  if (error) {
    console.error("Error adding bulk tracking events:", error);
    throw error;
  }
  
  return data || [];
};

// Update the order's tracking JSON with latest event summary
export const updateOrderTrackingJson = async (
  orderId: string,
  trackingData: {
    events?: Array<{
      status: string;
      timestamp: string;
      description: string;
      location?: string;
    }>;
    barcode?: string;
    driver?: {
      id: string;
      name: string;
      phone: string;
      photo: string;
    };
    signature?: string;
    deliveredAt?: string;
    estimatedArrival?: string;
  }
): Promise<void> => {
  // Get current tracking data
  const { data: currentOrder, error: fetchError } = await supabase
    .from('orders')
    .select('tracking')
    .eq('id', orderId)
    .single();

  if (fetchError) throw fetchError;

  const currentTracking = (currentOrder?.tracking as Record<string, unknown>) || {};
  
  // Merge tracking data
  const updatedTracking = {
    ...currentTracking,
    ...trackingData,
    events: [
      ...(Array.isArray(currentTracking.events) ? currentTracking.events : []),
      ...(trackingData.events || [])
    ]
  };

  const { error } = await supabase
    .from('orders')
    .update({ 
      tracking: updatedTracking as unknown as Json,
      updated_at: new Date().toISOString()
    })
    .eq('id', orderId);

  if (error) throw error;
};

// Get estimated delivery time based on current status and location
export const getEstimatedDeliveryTime = (
  status: string,
  currentLocation?: string
): string => {
  const now = new Date();
  let hoursToAdd = 0;

  switch (status) {
    case 'pending':
      hoursToAdd = 24;
      break;
    case 'processing':
      hoursToAdd = 18;
      break;
    case 'dispatched':
      if (currentLocation?.includes('Regional Hub')) {
        hoursToAdd = 4;
      } else if (currentLocation?.includes('Sorting')) {
        hoursToAdd = 8;
      } else {
        hoursToAdd = 12;
      }
      break;
    case 'out_for_delivery':
      hoursToAdd = 2;
      break;
    default:
      hoursToAdd = 24;
  }

  const estimated = new Date(now.getTime() + hoursToAdd * 60 * 60 * 1000);
  return estimated.toISOString();
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
