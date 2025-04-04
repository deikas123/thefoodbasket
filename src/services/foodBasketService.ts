import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types";
import { getProductById } from "@/services/productService";
import { convertToProduct } from "@/utils/typeConverters";

export const getAllFoodBaskets = async () => {
  try {
    const { data, error } = await supabase
      .from('food_baskets')
      .select('*');

    if (error) {
      console.error("Error fetching food baskets:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error fetching food baskets:", error);
    throw error;
  }
};

export const getFoodBasketById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('food_baskets')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error("Error fetching food basket:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error fetching food basket:", error);
    throw error;
  }
};

// Modify this function to fix type issues
export const getFoodBasketWithProducts = async (id: string) => {
  try {
    // Fetch the food basket
    const { data: basket, error: basketError } = await supabase
      .from('food_baskets')
      .select('*')
      .eq('id', id)
      .single();

    if (basketError) {
      console.error("Error fetching food basket:", basketError);
      throw basketError;
    }

    // Fetch the basket items
    const { data: basketItems, error: itemsError } = await supabase
      .from('food_basket_items')
      .select('*')
      .eq('basket_id', id);

    if (itemsError) {
      console.error("Error fetching food basket items:", itemsError);
      throw itemsError;
    }

    // Fetch products for each basket item
    const products: Product[] = [];
    
    for (const item of basketItems) {
      const productData = await getProductById(item.product_id);
      if (productData) {
        // Convert ProductType to Product
        const product = convertToProduct(productData);
        products.push({
          ...product,
          quantity: item.quantity
        });
      }
    }

    return {
      ...basket,
      products
    };
  } catch (error) {
    console.error("Error fetching food basket with products:", error);
    throw error;
  }
};

export const createFoodBasket = async (foodBasket: any) => {
  try {
    const { data, error } = await supabase
      .from('food_baskets')
      .insert([foodBasket])
      .select()
      .single();

    if (error) {
      console.error("Error creating food basket:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error creating food basket:", error);
    throw error;
  }
};

export const updateFoodBasket = async (id: string, updates: any) => {
  try {
    const { data, error } = await supabase
      .from('food_baskets')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error("Error updating food basket:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error updating food basket:", error);
    throw error;
  }
};

export const deleteFoodBasket = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('food_baskets')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting food basket:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error deleting food basket:", error);
    throw error;
  }
};
