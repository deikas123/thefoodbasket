
import { supabase } from "@/integrations/supabase/client";
import { FoodBasket, FoodBasketItem } from "@/types/foodBasket";
import { Product } from "@/types";
import { ProductType } from "@/types/supabase";
import { getProductById } from "@/services/product";
import { convertToProduct } from "@/utils/typeConverters";

// Get all food baskets
export const getAllFoodBaskets = async (): Promise<FoodBasket[]> => {
  try {
    const { data, error } = await supabase
      .from('food_baskets')
      .select('*');
    
    if (error) {
      console.error("Error fetching food baskets:", error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error("Error in getAllFoodBaskets:", error);
    return [];
  }
};

// Get food basket by ID
export const getFoodBasketById = async (id: string): Promise<FoodBasket | null> => {
  try {
    const { data, error } = await supabase
      .from('food_baskets')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error("Error fetching food basket:", error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error("Error in getFoodBasketById:", error);
    return null;
  }
};

// Get food basket items by basket ID
export const getFoodBasketItems = async (basketId: string): Promise<FoodBasketItem[]> => {
  try {
    const { data, error } = await supabase
      .from('food_basket_items')
      .select('*')
      .eq('basket_id', basketId);
    
    if (error) {
      console.error("Error fetching food basket items:", error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error("Error in getFoodBasketItems:", error);
    return [];
  }
};

// Get food basket with full product details
export const getFoodBasketWithProducts = async (basketId: string): Promise<{basket: FoodBasket | null, products: (Product & { quantity: number })[]}> => {
  try {
    // Get the basket
    const basket = await getFoodBasketById(basketId);
    if (!basket) {
      return { basket: null, products: [] };
    }
    
    // Get the basket items
    const basketItems = await getFoodBasketItems(basketId);
    
    // Get full product details for each item
    const productsPromises = basketItems.map(async (item) => {
      const productData = await getProductById(item.productId);
      if (productData) {
        // Convert ProductType to Product and add quantity
        const product = convertToProduct(productData);
        return {
          ...product,
          quantity: item.quantity
        };
      }
      return null;
    });
    
    const productsWithQuantity = await Promise.all(productsPromises);
    
    // Filter out any null products with a corrected type predicate
    const products = productsWithQuantity.filter((product): product is (Product & { quantity: number }) => 
      product !== null
    );
    
    return { basket, products };
  } catch (error) {
    console.error("Error in getFoodBasketWithProducts:", error);
    return { basket: null, products: [] };
  }
};

// Get user's saved baskets
export const getUserFoodBaskets = async (): Promise<FoodBasket[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return [];
    }
    
    const { data, error } = await supabase
      .from('food_baskets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching user food baskets:", error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error("Error in getUserFoodBaskets:", error);
    return [];
  }
};

// Delete a food basket
export const deleteFoodBasket = async (basketId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('food_baskets')
      .delete()
      .eq('id', basketId);
    
    if (error) {
      console.error("Error deleting food basket:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in deleteFoodBasket:", error);
    return false;
  }
};
