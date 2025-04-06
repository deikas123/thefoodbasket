
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types";
import { ProductType } from "@/types/supabase";
import { convertToProducts } from "@/utils/typeConverters";

// Add additional helper function for recommended products
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
    
    // Find other products in the same category
    const { data: relatedProducts, error } = await supabase
      .from('products')
      .select('*, categories(name, slug)')
      .eq('category_id', product.category_id)
      .neq('id', productId)
      .limit(4);
    
    if (error) {
      console.error("Error fetching related products:", error);
      return [];
    }
    
    const relatedProductTypes = relatedProducts.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      image: item.image,
      category: item.categories?.slug || '',
      stock: item.stock,
      featured: item.featured,
      rating: item.rating,
      num_reviews: item.num_reviews,
      numReviews: item.num_reviews,
      discountPercentage: item.discount_percentage,
      created_at: item.created_at,
      updated_at: item.updated_at
    }));
    
    return convertToProducts(relatedProductTypes);
  } catch (error) {
    console.error("Error fetching related products:", error);
    return [];
  }
};
