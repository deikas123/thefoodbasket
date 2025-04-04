import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types";
import { getProductById } from "@/services/productService";
import { convertToProduct, convertFromProduct } from "@/utils/typeConverters";
import { FoodBasket } from "@/types/foodBasket";

export const getAllFoodBaskets = async (): Promise<FoodBasket[] | null> => {
  try {
    const { data, error } = await supabase
      .from('food_baskets')
      .select('*, food_basket_items(*)');

    if (error) {
      console.error("Error fetching food baskets:", error);
      throw error;
    }

    // Map the data to our FoodBasket type
    const foodBaskets: FoodBasket[] = data.map(basket => ({
      id: basket.id,
      name: basket.name,
      description: basket.description || undefined,
      recipe: basket.recipe,
      image: basket.image || undefined,
      totalPrice: parseFloat(basket.total_price),
      createdAt: basket.created_at,
      updatedAt: basket.updated_at,
      items: (basket.food_basket_items || []).map((item: any) => ({
        id: item.id,
        basketId: item.basket_id,
        productId: item.product_id,
        quantity: item.quantity,
        createdAt: item.created_at,
      }))
    }));

    return foodBaskets;
  } catch (error) {
    console.error("Error fetching food baskets:", error);
    throw error;
  }
};

export const getFoodBasketById = async (id: string): Promise<FoodBasket | null> => {
  try {
    const { data, error } = await supabase
      .from('food_baskets')
      .select('*, food_basket_items(*)')
      .eq('id', id)
      .single();

    if (error) {
      console.error("Error fetching food basket:", error);
      throw error;
    }

    // Map the data to our FoodBasket type
    const foodBasket: FoodBasket = {
      id: data.id,
      name: data.name,
      description: data.description || undefined,
      recipe: data.recipe,
      image: data.image || undefined,
      totalPrice: parseFloat(data.total_price),
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      items: (data.food_basket_items || []).map((item: any) => ({
        id: item.id,
        basketId: item.basket_id,
        productId: item.product_id,
        quantity: item.quantity,
        createdAt: item.created_at,
      }))
    };

    return foodBasket;
  } catch (error) {
    console.error("Error fetching food basket:", error);
    throw error;
  }
};

export const getFoodBasketWithProducts = async (id: string) => {
  try {
    // Fetch the food basket
    const basket = await getFoodBasketById(id);

    if (!basket) {
      throw new Error("Food basket not found");
    }

    // Fetch products for each basket item
    const products: Product[] = [];
    
    for (const item of basket.items) {
      const productData = await getProductById(item.productId);
      if (productData) {
        // Convert ProductType to Product
        const product = convertToProduct(productData);
        // Create a new object with quantity instead of modifying the product
        products.push({
          ...product,
          // We can't add quantity directly to Product objects
          // Instead we'll handle this at rendering time
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
