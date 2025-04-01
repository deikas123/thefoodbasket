
import { supabase } from "@/integrations/supabase/client";
import { FoodBasket, FoodBasketItem } from "@/types/foodBasket";
import { Product } from "@/types";
import { getProducts } from "./productService";
import { Database } from "@/types/database.types";

// Get all food baskets
export const getFoodBaskets = async (): Promise<FoodBasket[]> => {
  const { data, error } = await supabase
    .from("food_baskets")
    .select("*")
    .order("created_at", { ascending: false });
  
  if (error) {
    console.error("Error fetching food baskets:", error);
    return [];
  }
  
  // Map database response to FoodBasket[] type
  const baskets = (data as Database['public']['Tables']['food_baskets']['Row'][]).map(item => ({
    id: item.id,
    name: item.name,
    description: item.description || undefined,
    recipe: item.recipe,
    image: item.image || undefined,
    totalPrice: item.total_price,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    items: [] // Initialize with empty array
  }));
  
  // Get items for each basket
  for (const basket of baskets) {
    const basketItems = await getFoodBasketItems(basket.id);
    basket.items = basketItems;
  }
  
  return baskets;
};

// Get food basket by id
export const getFoodBasketById = async (id: string): Promise<FoodBasket | null> => {
  const { data, error } = await supabase
    .from("food_baskets")
    .select("*")
    .eq("id", id)
    .single();
  
  if (error) {
    console.error("Error fetching food basket:", error);
    return null;
  }
  
  // Map database response to FoodBasket type
  const item = data as Database['public']['Tables']['food_baskets']['Row'];
  const basket: FoodBasket = {
    id: item.id,
    name: item.name,
    description: item.description || undefined,
    recipe: item.recipe,
    image: item.image || undefined,
    totalPrice: item.total_price,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    items: [] // Initialize with empty array
  };
  
  const basketItems = await getFoodBasketItems(basket.id);
  basket.items = basketItems;
  
  return basket;
};

// Get food basket items
export const getFoodBasketItems = async (basketId: string): Promise<FoodBasketItem[]> => {
  const { data, error } = await supabase
    .from("food_basket_items")
    .select("*")
    .eq("basket_id", basketId);
  
  if (error) {
    console.error("Error fetching food basket items:", error);
    return [];
  }
  
  // Map database response to FoodBasketItem[] type
  return (data as Database['public']['Tables']['food_basket_items']['Row'][]).map(item => ({
    id: item.id,
    basketId: item.basket_id,
    productId: item.product_id,
    quantity: item.quantity,
    createdAt: item.created_at
  }));
};

// Generate personalized food baskets based on user's order history
export const generatePersonalizedBaskets = async (): Promise<FoodBasket[]> => {
  // For now, we'll use a simple algorithm based on products category grouping
  // In a real app, you would use order history data from the database
  
  // Get all products
  const products = await getProducts();
  
  // Group products by category
  const productsByCategory: { [key: string]: Product[] } = {};
  products.forEach((product) => {
    if (!productsByCategory[product.category]) {
      productsByCategory[product.category] = [];
    }
    productsByCategory[product.category].push(product);
  });
  
  // Create sample recipe templates
  const recipeTemplates = [
    "1. Mix {item1} with {item2}.\n2. Add {item3} and stir.\n3. Garnish with {item4} and enjoy!",
    "1. Prepare {item1} according to package instructions.\n2. Heat {item2} in a pan.\n3. Combine with {item3} and {item4}, then serve.",
    "1. Chop {item1} and {item2}.\n2. Sauté with {item3}.\n3. Add {item4} on top and serve hot.",
  ];
  
  // Generate baskets (one for each major category)
  const baskets: FoodBasket[] = [];
  const categories = Object.keys(productsByCategory);
  
  categories.forEach((category, index) => {
    const products = productsByCategory[category];
    if (products.length >= 4) { // Ensure we have enough products
      // Select 4 random products from the category
      const selectedProducts = products
        .sort(() => 0.5 - Math.random())
        .slice(0, 4);
      
      // Calculate total price with a small discount
      const totalPrice = selectedProducts.reduce(
        (sum, product) => sum + product.price, 0
      ) * 0.95; // 5% discount
      
      // Generate recipe from template
      const recipeTemplate = recipeTemplates[index % recipeTemplates.length];
      const recipe = recipeTemplate
        .replace("{item1}", selectedProducts[0].name)
        .replace("{item2}", selectedProducts[1].name)
        .replace("{item3}", selectedProducts[2].name)
        .replace("{item4}", selectedProducts[3].name);
      
      // Create a basket
      const basket: FoodBasket = {
        id: `sample-${index}`, // This would be a real ID in the database
        name: `${category} Special Basket`,
        description: `A perfect combination of ${category} items at a special price.`,
        recipe,
        image: selectedProducts[0].image, // Use first product image
        totalPrice,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        items: selectedProducts.map((product, i) => ({
          id: `sample-item-${index}-${i}`,
          basketId: `sample-${index}`,
          productId: product.id,
          quantity: 1,
          createdAt: new Date().toISOString()
        }))
      };
      
      baskets.push(basket);
    }
  });
  
  return baskets.slice(0, 4); // Return max 4 baskets
};
