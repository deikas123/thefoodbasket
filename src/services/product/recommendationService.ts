
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types";
import { convertToProducts } from "@/utils/typeConverters";

// Get products frequently purchased together with a specific product
export const getFrequentlyPurchasedTogether = async (productId: string): Promise<Product[]> => {
  try {
    // Get the product to find its category
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('category_id')
      .eq('id', productId)
      .single();
    
    if (productError || !product) {
      console.error("Error fetching product for recommendations:", productError);
      return [];
    }
    
    // Find other products in the same category (for demonstration)
    // In a real application, you might want to analyze order history to find actual frequently purchased together products
    const { data: relatedProducts, error } = await supabase
      .from('products')
      .select('*')
      .eq('category_id', product.category_id)
      .neq('id', productId)
      .limit(4);
    
    if (error) {
      console.error("Error fetching related products:", error);
      return [];
    }
    
    return convertToProducts(relatedProducts);
  } catch (error) {
    console.error("Error fetching related products:", error);
    return [];
  }
};
