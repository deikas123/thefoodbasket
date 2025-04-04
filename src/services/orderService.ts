
import { supabase } from "@/integrations/supabase/client";
import { OrderType, OrderStatus, OrderItem } from "@/types/supabase";
import { Json } from "@/types/database.types";

export interface CreateOrderInput {
  user_id: string;
  delivery_address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  delivery_method: {
    id: string;
    name: string;
    price: number;
    estimatedDays: number;
  };
  payment_method: {
    id: string;
    name: string;
    last4?: string;
  };
  items: OrderItem[];
  subtotal: number;
  delivery_fee: number;
  discount?: number;
  total: number;
  notes?: string;
  estimated_delivery: string;
  promo_code?: string;
  loyalty_points_used?: number;
}

export const createOrder = async (orderData: CreateOrderInput): Promise<OrderType> => {
  // Convert to the right format for Supabase
  const orderDataForDb = {
    ...orderData,
    status: 'pending' as OrderStatus,
    items: orderData.items as unknown as Json,
    delivery_address: orderData.delivery_address as unknown as Json,
    delivery_method: orderData.delivery_method as unknown as Json,
    payment_method: orderData.payment_method as unknown as Json
  };
    
  const { data, error } = await supabase
    .from('orders')
    .insert([orderDataForDb])
    .select()
    .single();
    
  if (error) {
    console.error("Error creating order:", error);
    throw error;
  }
  
  // Cast the data to OrderType to ensure proper type
  return data as unknown as OrderType;
};

export const getUserOrders = async (userId: string): Promise<OrderType[]> => {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
  
  // Process the data to ensure proper types
  const orders = data?.map(order => {
    return {
      ...order,
      status: order.status as OrderStatus,
      items: order.items as unknown as OrderItem[],
      delivery_address: order.delivery_address as any,
      delivery_method: order.delivery_method as any,
      payment_method: order.payment_method as any,
      tracking: order.tracking ? {
        ...order.tracking as any,
        events: Array.isArray((order.tracking as any)?.events) ? (order.tracking as any).events : []
      } : undefined
    } as OrderType;
  }) || [];
  
  return orders;
};

export const getOrderById = async (orderId: string): Promise<OrderType | null> => {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();
    
  if (error) {
    if (error.code === 'PGRST116') {
      // Order not found
      return null;
    }
    console.error("Error fetching order:", error);
    throw error;
  }
  
  // Process the data to ensure proper types
  const order = {
    ...data,
    status: data.status as OrderStatus,
    items: data.items as unknown as OrderItem[],
    delivery_address: data.delivery_address as any,
    delivery_method: data.delivery_method as any,
    payment_method: data.payment_method as any,
    tracking: data.tracking ? {
      ...data.tracking as any,
      events: Array.isArray((data.tracking as any)?.events) ? (data.tracking as any).events : []
    } : undefined
  } as OrderType;
  
  return order;
};

export const updateOrderStatus = async (
  orderId: string, 
  status: OrderStatus, 
  trackingEvent?: { 
    status: OrderStatus; 
    timestamp: string; 
    location?: string; 
    note?: string;
    signature?: string;
    deliveredAt?: string;
  }
): Promise<OrderType> => {
  // Get current order to access tracking
  const { data: currentOrder, error: fetchError } = await supabase
    .from('orders')
    .select('tracking')
    .eq('id', orderId)
    .single();
  
  if (fetchError) {
    console.error("Error fetching order for tracking update:", fetchError);
    throw fetchError;
  }
  
  // Prepare tracking update
  const currentTracking = currentOrder.tracking || { events: [] };
  const updatedTracking = {
    events: [
      ...(Array.isArray((currentTracking as any)?.events) ? (currentTracking as any).events : []),
      trackingEvent || { 
        status, 
        timestamp: new Date().toISOString() 
      }
    ],
    // Add signature and deliveredAt if provided
    ...(trackingEvent?.signature ? { signature: trackingEvent.signature } : {}),
    ...(trackingEvent?.deliveredAt ? { deliveredAt: trackingEvent.deliveredAt } : {})
  };
  
  // Update order
  const { data, error } = await supabase
    .from('orders')
    .update({
      status,
      tracking: updatedTracking as unknown as Json,
      updated_at: new Date().toISOString()
    })
    .eq('id', orderId)
    .select()
    .single();
    
  if (error) {
    console.error("Error updating order status:", error);
    throw error;
  }
  
  // Process the data to ensure proper types
  const order = {
    ...data,
    status: data.status as OrderStatus,
    items: data.items as unknown as OrderItem[],
    delivery_address: data.delivery_address as any,
    delivery_method: data.delivery_method as any,
    payment_method: data.payment_method as any,
    tracking: data.tracking ? {
      ...data.tracking as any,
      events: Array.isArray((data.tracking as any)?.events) ? (data.tracking as any).events : []
    } : undefined
  } as OrderType;
  
  return order;
};

export const getAllOrders = async (): Promise<OrderType[]> => {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error("Error fetching all orders:", error);
    throw error;
  }
  
  // Process the data to ensure proper types
  const orders = data?.map(order => {
    return {
      ...order,
      status: order.status as OrderStatus,
      items: order.items as unknown as OrderItem[],
      delivery_address: order.delivery_address as any,
      delivery_method: order.delivery_method as any,
      payment_method: order.payment_method as any,
      tracking: order.tracking ? {
        ...order.tracking as any,
        events: Array.isArray((order.tracking as any)?.events) ? (order.tracking as any).events : []
      } : undefined
    } as OrderType;
  }) || [];
  
  return orders;
};

export const getDeliveryOrders = async (): Promise<OrderType[]> => {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .in('status', ['dispatched', 'out_for_delivery'])
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error("Error fetching delivery orders:", error);
    throw error;
  }
  
  // Process the data to ensure proper types
  const orders = data?.map(order => {
    return {
      ...order,
      status: order.status as OrderStatus,
      items: order.items as unknown as OrderItem[],
      delivery_address: order.delivery_address as any,
      delivery_method: order.delivery_method as any,
      payment_method: order.payment_method as any,
      tracking: order.tracking ? {
        ...order.tracking as any,
        events: Array.isArray((order.tracking as any)?.events) ? (order.tracking as any).events : []
      } : undefined
    } as OrderType;
  }) || [];
  
  return orders;
};

// Add cancelOrder function that was missing
export const cancelOrder = async (orderId: string): Promise<OrderType> => {
  const { data, error } = await supabase
    .from('orders')
    .update({
      status: 'cancelled' as OrderStatus,
      updated_at: new Date().toISOString()
    })
    .eq('id', orderId)
    .select()
    .single();
    
  if (error) {
    console.error("Error cancelling order:", error);
    throw error;
  }
  
  // Process the data to ensure proper types
  const order = {
    ...data,
    status: data.status as OrderStatus,
    items: data.items as unknown as OrderItem[],
    delivery_address: data.delivery_address as any,
    delivery_method: data.delivery_method as any,
    payment_method: data.payment_method as any,
    tracking: data.tracking ? {
      ...data.tracking as any,
      events: Array.isArray((data.tracking as any)?.events) ? (data.tracking as any).events : []
    } : undefined
  } as OrderType;
  
  return order;
};
