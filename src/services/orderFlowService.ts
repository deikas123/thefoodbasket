
import { supabase } from "@/integrations/supabase/client";
import { addTrackingEvent } from "./orderTrackingService";
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

    await addTrackingEvent(
      orderId, 
      "processing", 
      `Order packing started. Barcode: ${barcode}`,
      "Fulfillment Center"
    );

    // Create customer notification
    await createOrderNotification(orderId, "processing");

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
      .select("items, tracking")
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
      packingVerifiedByBarcode: !!scannedBarcode
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

    await addTrackingEvent(
      orderId, 
      "dispatched", 
      "Order packed and verified. Ready for delivery pickup",
      "Fulfillment Center"
    );

    await createOrderNotification(orderId, "dispatched");

    return { success: true, message: "Order packed and ready for pickup", orderId };
  } catch (error) {
    console.error("Error completing packing:", error);
    return { success: false, message: "Failed to complete packing" };
  }
};

// Rider picks up order and starts delivery
export const startDelivery = async (orderId: string, riderId: string): Promise<OrderFlowResult> => {
  try {
    const { error } = await supabase
      .from("orders")
      .update({ 
        status: "out_for_delivery" as OrderStatus,
        assigned_to: riderId,
        updated_at: new Date().toISOString()
      })
      .eq("id", orderId);

    if (error) throw error;

    await addTrackingEvent(
      orderId, 
      "out_for_delivery", 
      "Order picked up and out for delivery"
    );

    await createOrderNotification(orderId, "out_for_delivery");

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
      events: [
        ...(Array.isArray(currentTracking?.events) ? currentTracking.events : []),
        {
          status: "delivered",
          timestamp: deliveredAt,
          description: "Order delivered and verified by barcode scan"
        }
      ],
      deliveredAt,
      deliveryVerifiedByBarcode: !!scannedBarcode,
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

    await createOrderNotification(orderId, "delivered");

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
      "Rider assigned for delivery"
    );

    return { success: true, message: "Rider assigned", orderId };
  } catch (error) {
    console.error("Error assigning rider:", error);
    return { success: false, message: "Failed to assign rider" };
  }
};

// Helper to create customer notifications
const createOrderNotification = async (orderId: string, status: string) => {
  try {
    // Get order to find user_id
    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .select("user_id")
      .eq("id", orderId)
      .single();

    if (fetchError || !order) return;

    const titles: Record<string, string> = {
      processing: "Order Being Packed",
      dispatched: "Order Ready for Delivery",
      out_for_delivery: "Order On Its Way",
      delivered: "Order Delivered"
    };

    const messages: Record<string, string> = {
      processing: "Your order is now being packed by our team.",
      dispatched: "Your order has been packed and is waiting for pickup.",
      out_for_delivery: "Your order is on its way! Track it in real-time.",
      delivered: "Your order has been delivered. Enjoy!"
    };

    await supabase.from("customer_notifications").insert({
      user_id: order.user_id,
      order_id: orderId,
      title: titles[status] || "Order Update",
      message: messages[status] || statusDescriptions[status],
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
