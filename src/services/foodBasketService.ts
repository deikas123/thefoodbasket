
import { supabase } from "@/integrations/supabase/client";
import { FoodBasket, FoodBasketItem } from "@/types/foodBasket";
import { Product } from "@/types";
import { getProductById } from "@/services/product";

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
      const product = await getProductById(item.productId);
      return product ? {
        ...product,
        quantity: item.quantity
      } : null;
    });
    
    const productsWithQuantity = await Promise.all(productsPromises);
    
    // Filter out any null products with a corrected type predicate
    const products = productsWithQuantity.filter((product): product is (Product & { quantity: number }) => 
      product !== null && typeof product === 'object'
    );
    
    return { basket, products };
  } catch (error) {
    console.error("Error in getFoodBasketWithProducts:", error);
    return { basket: null, products: [] };
  }
};
