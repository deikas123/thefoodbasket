
import { supabase } from "@/integrations/supabase/client";
import { AutoReplenishItem } from "@/types/autoReplenish";
import { Product } from "@/types";
import { getProductById } from "./productService";
import { toast } from "@/hooks/use-toast";
import { format, addDays } from "date-fns";
import { Database } from "@/types/database.types";

// Get user's auto replenish items
export const getUserAutoReplenishItems = async (): Promise<AutoReplenishItem[]> => {
  const { data, error } = await supabase
    .from("auto_replenish_items")
    .select("*")
    .order("next_order_date", { ascending: true });
  
  if (error) {
    console.error("Error fetching auto replenish items:", error);
    return [];
  }
  
  // Map database response to AutoReplenishItem[] type
  return (data as Database['public']['Tables']['auto_replenish_items']['Row'][]).map(item => ({
    id: item.id,
    userId: item.user_id,
    productId: item.product_id,
    quantity: item.quantity,
    frequencyDays: item.frequency_days,
    nextOrderDate: item.next_order_date,
    active: item.active,
    createdAt: item.created_at,
    updatedAt: item.updated_at
  }));
};

// Add item to auto replenish
export const addToAutoReplenish = async (
  productId: string,
  quantity: number,
  frequencyDays: number
): Promise<boolean> => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return false;
  
  // Calculate next order date
  const nextOrderDate = addDays(new Date(), frequencyDays).toISOString();
  
  // Check if product already exists in auto replenish
  const { data: existingItems } = await supabase
    .from("auto_replenish_items")
    .select("*")
    .eq("product_id", productId)
    .eq("user_id", user.user.id);
  
  if (existingItems && existingItems.length > 0) {
    // Update existing item
    const { error } = await supabase
      .from("auto_replenish_items")
      .update({
        quantity,
        frequency_days: frequencyDays,
        next_order_date: nextOrderDate,
        active: true,
      })
      .eq("id", existingItems[0].id);
    
    if (error) {
      console.error("Error updating auto replenish item:", error);
      toast({
        title: "Failed to update auto replenish",
        description: "Please try again later",
        variant: "destructive",
      });
      return false;
    }
  } else {
    // Create new item
    const { error } = await supabase
      .from("auto_replenish_items")
      .insert({
        user_id: user.user.id,
        product_id: productId,
        quantity,
        frequency_days: frequencyDays,
        next_order_date: nextOrderDate,
        active: true,
      });
    
    if (error) {
      console.error("Error adding auto replenish item:", error);
      toast({
        title: "Failed to add auto replenish",
        description: "Please try again later",
        variant: "destructive",
      });
      return false;
    }
  }
  
  // Get product name for toast message
  const product = await getProductById(productId);
  
  toast({
    title: "Auto Replenish Set",
    description: `${product?.name} will be automatically ordered every ${frequencyDays} days`,
  });
  
  return true;
};

// Toggle active status of auto replenish item
export const toggleAutoReplenishStatus = async (
  itemId: string,
  active: boolean
): Promise<boolean> => {
  const { error } = await supabase
    .from("auto_replenish_items")
    .update({ active })
    .eq("id", itemId);
  
  if (error) {
    console.error("Error toggling auto replenish status:", error);
    toast({
      title: "Failed to update status",
      description: "Please try again later",
      variant: "destructive",
    });
    return false;
  }
  
  toast({
    title: active ? "Auto Replenish Activated" : "Auto Replenish Paused",
    description: active 
      ? "The item will be automatically ordered according to schedule" 
      : "The item will not be automatically ordered until reactivated",
  });
  
  return true;
};

// Remove item from auto replenish
export const removeFromAutoReplenish = async (itemId: string): Promise<boolean> => {
  const { error } = await supabase
    .from("auto_replenish_items")
    .delete()
    .eq("id", itemId);
  
  if (error) {
    console.error("Error removing auto replenish item:", error);
    toast({
      title: "Failed to remove item",
      description: "Please try again later",
      variant: "destructive",
    });
    return false;
  }
  
  toast({
    title: "Item Removed",
    description: "The item has been removed from auto replenish",
  });
  
  return true;
};
