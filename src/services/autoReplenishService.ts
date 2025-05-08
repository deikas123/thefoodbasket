
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getProductById } from "@/services/product";

// Add an item to auto-replenish
export const addToAutoReplenish = async (
  productId: string,
  quantity: number = 1,
  frequencyDays: number = 30
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
    const nextOrderDate = new Date();
    nextOrderDate.setDate(nextOrderDate.getDate() + frequencyDays);
    
    // Insert into auto_replenish_items table
    const { error } = await supabase
      .from('auto_replenish_items')
      .insert({
        user_id: userId,
        product_id: productId,
        quantity,
        frequency_days: frequencyDays,
        next_order_date: nextOrderDate.toISOString(),
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
      .select(`*, product_id(*)`)
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

// Delete an auto-replenish item
export const deleteAutoReplenishItem = async (id: string): Promise<boolean> => {
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
    console.error("Error in deleteAutoReplenishItem:", error);
    return false;
  }
};
