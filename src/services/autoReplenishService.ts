import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getProductById } from "@/services/product";
import { createOrder } from "@/services/orderService";

// Add an item to auto-replenish with custom scheduling
export const addToAutoReplenish = async (
  productId: string,
  quantity: number = 1,
  frequencyDays: number = 30,
  customDays?: string[],
  customTime?: string
): Promise<boolean> => {
  try {
    // First, check if product exists
    const product = await getProductById(productId);
    if (!product) {
      console.error("Product not found");
      return false;
    }

    // Get user from session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error("Not authenticated");
    }

    const userId = session.user.id;
    
    // Calculate next order date
    const nextOrderDate = calculateNextOrderDate(frequencyDays, customDays, customTime);
    
    // Insert into auto_replenish_items table
    const { error } = await supabase
      .from('auto_replenish_items')
      .insert({
        user_id: userId,
        product_id: productId,
        quantity,
        frequency_days: frequencyDays,
        next_order_date: nextOrderDate.toISOString(),
        custom_days: customDays || null,
        custom_time: customTime || '09:00:00',
        active: true
      });
    
    if (error) {
      console.error("Error adding to auto-replenish:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in addToAutoReplenish:", error);
    return false;
  }
};

// Calculate next order date based on custom days or frequency
const calculateNextOrderDate = (
  frequencyDays: number, 
  customDays?: string[], 
  customTime?: string
): Date => {
  const now = new Date();
  const time = customTime || '09:00:00';
  const [hours, minutes] = time.split(':').map(Number);

  if (customDays && customDays.length > 0) {
    // Find the next occurrence of the specified days of week
    const dayNumbers = customDays.map(day => parseInt(day));
    let nextDate = new Date(now);
    nextDate.setDate(nextDate.getDate() + 1); // Start from tomorrow
    
    // Find the next matching day
    while (!dayNumbers.includes(nextDate.getDay())) {
      nextDate.setDate(nextDate.getDate() + 1);
    }
    
    nextDate.setHours(hours, minutes, 0, 0);
    return nextDate;
  } else {
    // Use frequency_days
    const nextDate = new Date(now);
    nextDate.setDate(nextDate.getDate() + frequencyDays);
    nextDate.setHours(hours, minutes, 0, 0);
    return nextDate;
  }
};

// Get all auto-replenish items for current user
export const getUserAutoReplenishItems = async () => {
  try {
    // Get user from session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error("Not authenticated");
    }

    const userId = session.user.id;
    
    const { data, error } = await supabase
      .from('auto_replenish_items')
      .select('*')
      .eq('user_id', userId)
      .eq('active', true);
    
    if (error) {
      console.error("Error fetching auto-replenish items:", error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error("Error in getUserAutoReplenishItems:", error);
    return [];
  }
};

// Process pending auto replenish orders (creates actual orders)
export const processAutoReplenishOrders = async (): Promise<void> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    // Get pending auto replenish orders for the user
    const { data: pendingOrders, error } = await supabase
      .from('auto_replenish_orders')
      .select(`
        *,
        auto_replenish_items (
          *
        )
      `)
      .eq('status', 'pending')
      .lte('scheduled_date', new Date().toISOString());

    if (error || !pendingOrders) {
      console.error("Error fetching pending orders:", error);
      return;
    }

    for (const order of pendingOrders) {
      try {
        const item = order.auto_replenish_items;
        if (!item) continue;

        // Get product details
        const product = await getProductById(item.product_id);
        if (!product) {
          await markOrderAsFailed(order.id, "Product not found");
          continue;
        }

        // Get user's default address (simplified - you might want to store preferred address)
        const { data: addresses } = await supabase
          .from('addresses')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('is_default', true)
          .limit(1);

        if (!addresses || addresses.length === 0) {
          await markOrderAsFailed(order.id, "No default address found");
          continue;
        }

        const address = addresses[0];

        // Create the order
        const orderData = {
          user_id: session.user.id,
          delivery_address: {
            street: address.street,
            city: address.city,
            state: address.state,
            zipCode: address.zip_code
          },
          delivery_method: {
            id: 'standard',
            name: 'Standard Delivery',
            price: 5.99,
            estimatedDays: 3
          },
          payment_method: {
            id: 'auto_replenish',
            name: 'Auto Replenish (Default Payment)'
          },
          items: [{
            product: {
              id: product.id,
              name: product.name,
              price: product.price,
              image: product.image
            },
            quantity: item.quantity
          }],
          subtotal: product.price * item.quantity,
          delivery_fee: 5.99,
          total: (product.price * item.quantity) + 5.99,
          estimated_delivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          notes: `Auto-replenish order for ${product.name}`
        };

        const createdOrder = await createOrder(orderData);

        // Mark auto replenish order as completed
        await supabase
          .from('auto_replenish_orders')
          .update({
            status: 'completed',
            order_id: createdOrder.id,
            updated_at: new Date().toISOString()
          })
          .eq('id', order.id);

        toast(`Auto-replenish order created for ${product.name}`);

      } catch (error) {
        console.error("Error processing auto replenish order:", error);
        await markOrderAsFailed(order.id, error.message);
      }
    }
  } catch (error) {
    console.error("Error in processAutoReplenishOrders:", error);
  }
};

const markOrderAsFailed = async (orderId: string, errorMessage: string) => {
  await supabase
    .from('auto_replenish_orders')
    .update({
      status: 'failed',
      error_message: errorMessage,
      updated_at: new Date().toISOString()
    })
    .eq('id', orderId);
};

// Toggle auto-replenish item status
export const toggleAutoReplenishStatus = async (
  id: string,
  active: boolean
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('auto_replenish_items')
      .update({ active })
      .eq('id', id);
    
    if (error) {
      console.error("Error updating auto-replenish status:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in toggleAutoReplenishStatus:", error);
    return false;
  }
};

// Delete an auto-replenish item
export const removeFromAutoReplenish = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('auto_replenish_items')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error("Error deleting auto-replenish item:", error);
      return false;
    }
    
    toast("Auto-replenishment removed");
    return true;
  } catch (error) {
    console.error("Error in removeFromAutoReplenish:", error);
    return false;
  }
};

// Update an auto-replenish item
export const updateAutoReplenishItem = async (
  id: string,
  updates: {
    quantity?: number;
    frequencyDays?: number;
    active?: boolean;
  }
): Promise<boolean> => {
  try {
    const updateData: any = {};
    
    if (updates.quantity !== undefined) {
      updateData.quantity = updates.quantity;
    }
    
    if (updates.frequencyDays !== undefined) {
      updateData.frequency_days = updates.frequencyDays;
      
      // Recalculate next order date if frequency changes
      const { data } = await supabase
        .from('auto_replenish_items')
        .select('created_at')
        .eq('id', id)
        .single();
      
      if (data) {
        const createdDate = new Date(data.created_at);
        const nextOrderDate = new Date(createdDate);
        nextOrderDate.setDate(nextOrderDate.getDate() + updates.frequencyDays);
        updateData.next_order_date = nextOrderDate.toISOString();
      }
    }
    
    if (updates.active !== undefined) {
      updateData.active = updates.active;
    }
    
    const { error } = await supabase
      .from('auto_replenish_items')
      .update(updateData)
      .eq('id', id);
    
    if (error) {
      console.error("Error updating auto-replenish item:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in updateAutoReplenishItem:", error);
    return false;
  }
};
