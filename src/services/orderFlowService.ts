
import { supabase } from "@/integrations/supabase/client";
import { addTrackingEvent, TRACKING_LOCATIONS, updateOrderTrackingJson } from "./orderTrackingService";
import { OrderStatus, OrderItem } from "@/types/supabase";
import { Json } from "@/types/database.types";
import { generateOrderBarcode } from "@/utils/barcodeGenerator";

export interface OrderFlowResult {
  success: boolean;
  message: string;
  orderId?: string;
  barcode?: string;
}

// Status flow: pending → processing → dispatched → out_for_delivery → delivered
const statusDescriptions: Record<string, string> = {
  pending: "Order received and awaiting processing",
  processing: "Order is being packed",
  dispatched: "Order is packed and ready for pickup",
  out_for_delivery: "Order is on its way",
  delivered: "Order has been delivered",
  cancelled: "Order has been cancelled"
};

// Get regional hub based on delivery address
const getRegionalHub = (deliveryAddress: any): string => {
  const city = deliveryAddress?.city?.toLowerCase() || '';
  const street = deliveryAddress?.street?.toLowerCase() || '';
  
  if (city.includes('ruiru') || street.includes('ruiru')) {
    return TRACKING_LOCATIONS.REGIONAL_HUB_RUIRU;
  }
  if (city.includes('thika') || street.includes('thika')) {
    return TRACKING_LOCATIONS.REGIONAL_HUB_THIKA;
  }
  if (city.includes('karen') || street.includes('karen')) {
    return TRACKING_LOCATIONS.REGIONAL_HUB_KAREN;
  }
  if (city.includes('kiambu') || street.includes('kiambu')) {
    return TRACKING_LOCATIONS.REGIONAL_HUB_KIAMBU;
  }
  // Default to Ruiru for now
  return TRACKING_LOCATIONS.REGIONAL_HUB_RUIRU;
};

// Create initial order tracking when order is placed
export const initializeOrderTracking = async (orderId: string): Promise<void> => {
  try {
    await addTrackingEvent(
      orderId,
      "pending",
      "Order received and confirmed",
      TRACKING_LOCATIONS.MAIN_WAREHOUSE,
      "warehouse"
    );
  } catch (error) {
    console.error("Error initializing order tracking:", error);
  }
};

// Packer starts working on an order - generates barcode
export const startPacking = async (orderId: string, packerId: string): Promise<OrderFlowResult> => {
  try {
    // Generate unique barcode for this order
    const barcode = generateOrderBarcode(orderId);
    
    // Get current tracking and add barcode
    const { data: currentOrder, error: fetchError } = await supabase
      .from("orders")
      .select("tracking")
      .eq("id", orderId)
      .single();

    if (fetchError) throw fetchError;

    const currentTracking = (currentOrder?.tracking as Record<string, unknown>) || {};
    const updatedTracking = {
      ...currentTracking,
      barcode,
      packingStartedAt: new Date().toISOString(),
      packerId
    };

    const { error } = await supabase
      .from("orders")
      .update({ 
        status: "processing" as OrderStatus,
        tracking: updatedTracking as unknown as Json,
        updated_at: new Date().toISOString()
      })
      .eq("id", orderId)
      .eq("status", "pending");

    if (error) throw error;

    // Add detailed tracking event
    await addTrackingEvent(
      orderId, 
      "processing", 
      "Order packing started by fulfillment team",
      TRACKING_LOCATIONS.MAIN_WAREHOUSE,
      "warehouse"
    );

    // Create customer notification
    await createOrderNotification(orderId, "processing", "Your order is now being prepared at our warehouse.");

    return { success: true, message: "Order packing started", orderId, barcode };
  } catch (error) {
    console.error("Error starting packing:", error);
    return { success: false, message: "Failed to start packing" };
  }
};

// Packer completes packing - requires barcode scan verification
export const completePacking = async (
  orderId: string, 
  packerId: string,
  scannedBarcode?: string
): Promise<OrderFlowResult> => {
  try {
    // Get order items and tracking (with barcode) first
    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .select("items, tracking, delivery_address")
      .eq("id", orderId)
      .single();

    if (fetchError) throw fetchError;

    const tracking = order.tracking as Record<string, unknown>;
    const expectedBarcode = tracking?.barcode as string;

    // Verify barcode if provided
    if (scannedBarcode && scannedBarcode !== expectedBarcode) {
      return { 
        success: false, 
        message: "Barcode does not match! Please scan the correct package." 
      };
    }

    const items = order.items as unknown as OrderItem[];

    // Deduct inventory for each item
    for (const item of items) {
      const { error: stockError } = await supabase.rpc('deduct_product_stock', {
        product_id: item.productId,
        quantity_to_deduct: item.quantity
      });

      if (stockError) {
        console.error(`Failed to deduct stock for product ${item.productId}:`, stockError);
      }
    }

    // Update tracking with packing completion
    const updatedTracking = {
      ...tracking,
      packingCompletedAt: new Date().toISOString(),
      packingVerifiedByBarcode: !!scannedBarcode,
      regionalHub: getRegionalHub(order.delivery_address)
    };

    // Update order status
    const { error } = await supabase
      .from("orders")
      .update({ 
        status: "dispatched" as OrderStatus,
        tracking: updatedTracking as unknown as Json,
        updated_at: new Date().toISOString()
      })
      .eq("id", orderId)
      .eq("status", "processing");

    if (error) throw error;

    // Add packing completed event
    await addTrackingEvent(
      orderId, 
      "processing", 
      "Order packed and quality checked",
      TRACKING_LOCATIONS.MAIN_WAREHOUSE,
      "warehouse"
    );

    // Add dispatch event
    await addTrackingEvent(
      orderId, 
      "dispatched", 
      `Order left ${TRACKING_LOCATIONS.MAIN_WAREHOUSE}`,
      TRACKING_LOCATIONS.MAIN_WAREHOUSE,
      "warehouse"
    );

    await createOrderNotification(
      orderId, 
      "dispatched", 
      "Great news! Your order has been packed and is on its way to a distribution center near you."
    );

    return { success: true, message: "Order packed and ready for pickup", orderId };
  } catch (error) {
    console.error("Error completing packing:", error);
    return { success: false, message: "Failed to complete packing" };
  }
};

// Add transit tracking events (for simulation/admin use)
export const addTransitEvent = async (
  orderId: string,
  eventType: 'arrived_sorting' | 'left_sorting' | 'arrived_hub' | 'left_hub',
  hubLocation?: string
): Promise<OrderFlowResult> => {
  try {
    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .select("tracking, delivery_address")
      .eq("id", orderId)
      .single();

    if (fetchError) throw fetchError;

    const tracking = order.tracking as Record<string, unknown>;
    const regionalHub = hubLocation || (tracking?.regionalHub as string) || getRegionalHub(order.delivery_address);

    let description = '';
    let location = '';

    switch (eventType) {
      case 'arrived_sorting':
        description = `Order arrived at ${TRACKING_LOCATIONS.SORTING_CENTER}`;
        location = TRACKING_LOCATIONS.SORTING_CENTER;
        break;
      case 'left_sorting':
        description = `Order departed ${TRACKING_LOCATIONS.SORTING_CENTER}`;
        location = TRACKING_LOCATIONS.SORTING_CENTER;
        break;
      case 'arrived_hub':
        description = `Order arrived at ${regionalHub}`;
        location = regionalHub;
        break;
      case 'left_hub':
        description = `Order departed ${regionalHub} for delivery`;
        location = regionalHub;
        break;
    }

    await addTrackingEvent(orderId, "dispatched", description, location, "transit");

    return { success: true, message: "Transit event added", orderId };
  } catch (error) {
    console.error("Error adding transit event:", error);
    return { success: false, message: "Failed to add transit event" };
  }
};

// Rider picks up order and starts delivery
export const startDelivery = async (
  orderId: string, 
  riderId: string,
  driverInfo?: { name: string; phone: string; photo: string }
): Promise<OrderFlowResult> => {
  try {
    // Get current tracking
    const { data: currentOrder, error: fetchError } = await supabase
      .from("orders")
      .select("tracking, delivery_address")
      .eq("id", orderId)
      .single();

    if (fetchError) throw fetchError;

    const currentTracking = (currentOrder?.tracking as Record<string, unknown>) || {};
    const regionalHub = (currentTracking?.regionalHub as string) || getRegionalHub(currentOrder.delivery_address);

    // Update tracking with driver info
    const updatedTracking = {
      ...currentTracking,
      deliveryStartedAt: new Date().toISOString(),
      driver: driverInfo ? {
        id: riderId,
        ...driverInfo
      } : undefined
    };

    const { error } = await supabase
      .from("orders")
      .update({ 
        status: "out_for_delivery" as OrderStatus,
        assigned_to: riderId,
        tracking: updatedTracking as unknown as Json,
        updated_at: new Date().toISOString()
      })
      .eq("id", orderId);

    if (error) throw error;

    await addTrackingEvent(
      orderId, 
      "out_for_delivery", 
      "Order picked up by delivery driver",
      regionalHub,
      "delivery"
    );

    await addTrackingEvent(
      orderId, 
      "out_for_delivery", 
      "Order is out for delivery",
      TRACKING_LOCATIONS.EN_ROUTE,
      "delivery"
    );

    await createOrderNotification(
      orderId, 
      "out_for_delivery", 
      "Your order is on its way! Your delivery driver is heading to your location now."
    );

    return { success: true, message: "Delivery started", orderId };
  } catch (error) {
    console.error("Error starting delivery:", error);
    return { success: false, message: "Failed to start delivery" };
  }
};

// Rider completes delivery - requires barcode scan verification
export const completeDelivery = async (
  orderId: string, 
  riderId: string,
  scannedBarcode?: string,
  signature?: string
): Promise<OrderFlowResult> => {
  try {
    const deliveredAt = new Date().toISOString();
    
    // Get current tracking
    const { data: currentOrder, error: fetchError } = await supabase
      .from("orders")
      .select("tracking")
      .eq("id", orderId)
      .single();

    if (fetchError) throw fetchError;

    const currentTracking = (currentOrder?.tracking as Record<string, unknown>) || { events: [] };
    const expectedBarcode = currentTracking?.barcode as string;

    // Verify barcode if provided
    if (scannedBarcode && scannedBarcode !== expectedBarcode) {
      return { 
        success: false, 
        message: "Barcode does not match! Please scan the correct package." 
      };
    }

    const updatedTracking = {
      ...currentTracking,
      deliveredAt,
      deliveryVerifiedByBarcode: !!scannedBarcode,
      deliveryCompletedBy: riderId,
      ...(signature ? { signature } : {})
    };

    const { error } = await supabase
      .from("orders")
      .update({ 
        status: "delivered" as OrderStatus,
        tracking: updatedTracking as unknown as Json,
        updated_at: deliveredAt
      })
      .eq("id", orderId);

    if (error) throw error;

    await addTrackingEvent(
      orderId, 
      "delivered", 
      "Order delivered successfully",
      TRACKING_LOCATIONS.DELIVERED,
      "customer"
    );

    await createOrderNotification(
      orderId, 
      "delivered", 
      "Your order has been delivered! Thank you for shopping with us. Enjoy your purchase!"
    );

    return { success: true, message: "Delivery completed", orderId };
  } catch (error) {
    console.error("Error completing delivery:", error);
    return { success: false, message: "Failed to complete delivery" };
  }
};

// Assign order to a rider
export const assignOrderToRider = async (orderId: string, riderId: string): Promise<OrderFlowResult> => {
  try {
    const { error } = await supabase
      .from("orders")
      .update({ 
        assigned_to: riderId,
        updated_at: new Date().toISOString()
      })
      .eq("id", orderId);

    if (error) throw error;

    await addTrackingEvent(
      orderId, 
      "dispatched", 
      "Delivery driver assigned to your order",
      undefined,
      "transit"
    );

    return { success: true, message: "Rider assigned", orderId };
  } catch (error) {
    console.error("Error assigning rider:", error);
    return { success: false, message: "Failed to assign rider" };
  }
};

// Helper to create customer notifications
const createOrderNotification = async (orderId: string, status: string, customMessage?: string) => {
  try {
    // Get order to find user_id
    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .select("user_id")
      .eq("id", orderId)
      .single();

    if (fetchError || !order) return;

    const titles: Record<string, string> = {
      processing: "Order Being Packed 📦",
      dispatched: "Order Dispatched 🚚",
      out_for_delivery: "Out for Delivery 🏃",
      delivered: "Order Delivered ✅"
    };

    const defaultMessages: Record<string, string> = {
      processing: "Your order is now being packed by our team.",
      dispatched: "Your order has been packed and is on its way!",
      out_for_delivery: "Your order is out for delivery! Track it in real-time.",
      delivered: "Your order has been delivered. Enjoy!"
    };

    await supabase.from("customer_notifications").insert({
      user_id: order.user_id,
      order_id: orderId,
      title: titles[status] || "Order Update",
      message: customMessage || defaultMessages[status] || statusDescriptions[status],
      type: "order_status"
    });
  } catch (error) {
    console.error("Error creating notification:", error);
  }
};

// Get order flow stats for dashboards
export const getOrderFlowStats = async () => {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("status")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const stats = {
      pending: 0,
      processing: 0,
      dispatched: 0,
      out_for_delivery: 0,
      delivered: 0,
      cancelled: 0,
      total: data?.length || 0
    };

    data?.forEach(order => {
      if (stats.hasOwnProperty(order.status)) {
        stats[order.status as keyof typeof stats]++;
      }
    });

    return stats;
  } catch (error) {
    console.error("Error getting flow stats:", error);
    return null;
  }
};

// Simulate full tracking journey (for demo/testing)
export const simulateOrderJourney = async (orderId: string): Promise<OrderFlowResult> => {
  try {
    const { data: order, error } = await supabase
      .from("orders")
      .select("delivery_address")
      .eq("id", orderId)
      .single();

    if (error) throw error;

    const regionalHub = getRegionalHub(order.delivery_address);
    const now = new Date();

    // Add series of tracking events with timestamps
    const events = [
      { status: "processing", description: "Order packing started", location: TRACKING_LOCATIONS.MAIN_WAREHOUSE, timestamp: new Date(now.getTime() - 180 * 60000).toISOString() },
      { status: "processing", description: "Order packed and quality checked", location: TRACKING_LOCATIONS.MAIN_WAREHOUSE, timestamp: new Date(now.getTime() - 150 * 60000).toISOString() },
      { status: "dispatched", description: `Order left ${TRACKING_LOCATIONS.MAIN_WAREHOUSE}`, location: TRACKING_LOCATIONS.MAIN_WAREHOUSE, timestamp: new Date(now.getTime() - 120 * 60000).toISOString() },
      { status: "dispatched", description: `Order arrived at ${TRACKING_LOCATIONS.SORTING_CENTER}`, location: TRACKING_LOCATIONS.SORTING_CENTER, timestamp: new Date(now.getTime() - 90 * 60000).toISOString() },
      { status: "dispatched", description: `Order departed ${TRACKING_LOCATIONS.SORTING_CENTER}`, location: TRACKING_LOCATIONS.SORTING_CENTER, timestamp: new Date(now.getTime() - 60 * 60000).toISOString() },
      { status: "dispatched", description: `Order arrived at ${regionalHub}`, location: regionalHub, timestamp: new Date(now.getTime() - 30 * 60000).toISOString() },
    ];

    for (const event of events) {
      await supabase.from("order_tracking_events").insert({
        order_id: orderId,
        status: event.status,
        description: event.description,
        location: event.location,
        timestamp: event.timestamp
      });
    }

    return { success: true, message: "Order journey simulated", orderId };
  } catch (error) {
    console.error("Error simulating journey:", error);
    return { success: false, message: "Failed to simulate journey" };
  }
};
