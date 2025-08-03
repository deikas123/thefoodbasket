import { supabase } from "@/integrations/supabase/client";
import { CartItem } from "@/types";

export interface StockValidationResult {
  isValid: boolean;
  insufficientItems: { productId: string; available: number; requested: number }[];
}

export const validateStock = async (items: CartItem[]): Promise<StockValidationResult> => {
  const insufficientItems: { productId: string; available: number; requested: number }[] = [];

  for (const item of items) {
    const { data: product, error } = await supabase
      .from('products')
      .select('stock')
      .eq('id', item.product.id)
      .single();

    if (error) {
      console.error('Error checking stock:', error);
      continue;
    }

    if (product.stock < item.quantity) {
      insufficientItems.push({
        productId: item.product.id,
        available: product.stock,
        requested: item.quantity
      });
    }
  }

  return {
    isValid: insufficientItems.length === 0,
    insufficientItems
  };
};

export const deductStock = async (items: CartItem[]): Promise<void> => {
  // First validate all items have sufficient stock
  const validation = await validateStock(items);
  if (!validation.isValid) {
    throw new Error(`Insufficient stock for items: ${validation.insufficientItems.map(i => i.productId).join(', ')}`);
  }

  // Deduct stock for each item
  for (const item of items) {
    const { error } = await supabase.rpc('deduct_product_stock', {
      product_id: item.product.id,
      quantity_to_deduct: item.quantity
    });

    if (error) {
      console.error('Error deducting stock:', error);
      throw new Error(`Failed to deduct stock for product ${item.product.id}`);
    }
  }
};

export const restoreStock = async (items: CartItem[]): Promise<void> => {
  for (const item of items) {
    const { error } = await supabase
      .from('products')
      .update({ 
        stock: supabase.sql`stock + ${item.quantity}`
      })
      .eq('id', item.product.id);

    if (error) {
      console.error('Error restoring stock:', error);
    }
  }
};