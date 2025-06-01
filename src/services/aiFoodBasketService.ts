
import { supabase } from "@/integrations/supabase/client";
import { getAllProducts } from "@/services/productService";
import { Product } from "@/types";
import { FoodBasket, FoodBasketItem } from "@/types/foodBasket";

interface BasketGenerationCriteria {
  maxPrice?: number;
  cuisineType?: string;
  dietaryRestrictions?: string[];
  servings?: number;
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

interface GeneratedBasket {
  name: string;
  description: string;
  recipe: string;
  products: { product: Product; quantity: number }[];
  totalPrice: number;
}

export const generateAIFoodBaskets = async (criteria: BasketGenerationCriteria = {}): Promise<GeneratedBasket[]> => {
  try {
    // Get all available products
    const products = await getAllProducts();
    if (!products || products.length === 0) {
      console.warn("No products available for basket generation");
      return [];
    }

    // Filter products based on stock
    const availableProducts = products.filter(product => product.stock > 0);
    
    // Generate baskets using AI logic (simulated for now)
    const baskets = await generateSmartBaskets(availableProducts, criteria);
    
    return baskets;
  } catch (error) {
    console.error("Error generating AI food baskets:", error);
    return [];
  }
};

const generateSmartBaskets = async (products: Product[], criteria: BasketGenerationCriteria): Promise<GeneratedBasket[]> => {
  const baskets: GeneratedBasket[] = [];
  
  // Breakfast basket
  if (!criteria.mealType || criteria.mealType === 'breakfast') {
    const breakfastProducts = selectProductsForMeal(products, 'breakfast', criteria.maxPrice);
    if (breakfastProducts.length > 0) {
      baskets.push({
        name: "Healthy Breakfast Bundle",
        description: "Start your day right with fresh fruits, whole grains, and protein",
        recipe: generateBreakfastRecipe(breakfastProducts),
        products: breakfastProducts,
        totalPrice: calculateTotalPrice(breakfastProducts)
      });
    }
  }
  
  // Dinner basket
  if (!criteria.mealType || criteria.mealType === 'dinner') {
    const dinnerProducts = selectProductsForMeal(products, 'dinner', criteria.maxPrice);
    if (dinnerProducts.length > 0) {
      baskets.push({
        name: "Family Dinner Kit",
        description: "Complete ingredients for a delicious home-cooked family meal",
        recipe: generateDinnerRecipe(dinnerProducts),
        products: dinnerProducts,
        totalPrice: calculateTotalPrice(dinnerProducts)
      });
    }
  }
  
  // Quick meal basket
  const quickMealProducts = selectProductsForMeal(products, 'quick', criteria.maxPrice);
  if (quickMealProducts.length > 0) {
    baskets.push({
      name: "Quick & Easy Meal",
      description: "Perfect for busy weeknights - ready in under 30 minutes",
      recipe: generateQuickMealRecipe(quickMealProducts),
      products: quickMealProducts,
      totalPrice: calculateTotalPrice(quickMealProducts)
    });
  }
  
  return baskets.filter(basket => !criteria.maxPrice || basket.totalPrice <= criteria.maxPrice);
};

const selectProductsForMeal = (products: Product[], mealType: string, maxPrice?: number): { product: Product; quantity: number }[] => {
  const selected: { product: Product; quantity: number }[] = [];
  let currentTotal = 0;
  
  // Define meal type preferences
  const mealPreferences = {
    breakfast: ['fruit', 'cereal', 'milk', 'bread', 'egg', 'yogurt', 'honey'],
    dinner: ['meat', 'chicken', 'beef', 'fish', 'vegetable', 'rice', 'pasta', 'sauce'],
    quick: ['pasta', 'sauce', 'cheese', 'bread', 'salad']
  };
  
  const preferences = mealPreferences[mealType as keyof typeof mealPreferences] || [];
  
  // Try to include products that match meal preferences
  for (const preference of preferences) {
    const matchingProducts = products.filter(p => 
      p.name.toLowerCase().includes(preference) && 
      !selected.some(s => s.product.id === p.id)
    );
    
    if (matchingProducts.length > 0) {
      const product = matchingProducts[Math.floor(Math.random() * matchingProducts.length)];
      const quantity = Math.ceil(Math.random() * 2); // 1-2 quantity
      const itemTotal = product.price * quantity;
      
      if (!maxPrice || currentTotal + itemTotal <= maxPrice * 0.8) {
        selected.push({ product, quantity });
        currentTotal += itemTotal;
        
        if (selected.length >= 5) break; // Limit basket size
      }
    }
  }
  
  // Fill remaining space with random products if needed
  while (selected.length < 3 && products.length > selected.length) {
    const randomProduct = products[Math.floor(Math.random() * products.length)];
    if (!selected.some(s => s.product.id === randomProduct.id)) {
      const quantity = 1;
      const itemTotal = randomProduct.price * quantity;
      
      if (!maxPrice || currentTotal + itemTotal <= maxPrice) {
        selected.push({ product: randomProduct, quantity });
        currentTotal += itemTotal;
      }
    }
  }
  
  return selected;
};

const generateBreakfastRecipe = (products: { product: Product; quantity: number }[]): string => {
  const productNames = products.map(p => p.product.name).join(', ');
  return `Delicious Breakfast Recipe\n\nIngredients:\n${products.map(p => `- ${p.quantity}x ${p.product.name}`).join('\n')}\n\nInstructions:\n1. Prepare all fresh ingredients\n2. Combine as desired for a nutritious breakfast\n3. Enjoy your healthy start to the day!\n\nServing suggestion: Perfect for 2-4 people depending on portions.`;
};

const generateDinnerRecipe = (products: { product: Product; quantity: number }[]): string => {
  const productNames = products.map(p => p.product.name).join(', ');
  return `Family Dinner Recipe\n\nIngredients:\n${products.map(p => `- ${p.quantity}x ${p.product.name}`).join('\n')}\n\nInstructions:\n1. Prep all ingredients according to package directions\n2. Cook proteins first, then add vegetables\n3. Season to taste and serve hot\n4. Enjoy your family meal!\n\nCooking time: Approximately 45-60 minutes\nServes: 4-6 people`;
};

const generateQuickMealRecipe = (products: { product: Product; quantity: number }[]): string => {
  return `Quick & Easy Recipe\n\nIngredients:\n${products.map(p => `- ${p.quantity}x ${p.product.name}`).join('\n')}\n\nInstructions:\n1. Heat and prepare according to package directions\n2. Combine ingredients in a simple, delicious way\n3. Ready in under 30 minutes!\n\nPerfect for busy weeknights when you need something fast and satisfying.`;
};

const calculateTotalPrice = (products: { product: Product; quantity: number }[]): number => {
  return products.reduce((total, item) => total + (item.product.price * item.quantity), 0);
};

export const saveGeneratedBasket = async (basket: GeneratedBasket): Promise<string | null> => {
  try {
    // Create the food basket
    const { data: basketData, error: basketError } = await supabase
      .from('food_baskets')
      .insert({
        name: basket.name,
        description: basket.description,
        recipe: basket.recipe,
        total_price: basket.totalPrice,
        image: basket.products[0]?.product.image || null
      })
      .select()
      .single();

    if (basketError) {
      console.error("Error creating basket:", basketError);
      return null;
    }

    // Create basket items
    const basketItems = basket.products.map(item => ({
      basket_id: basketData.id,
      product_id: item.product.id,
      quantity: item.quantity
    }));

    const { error: itemsError } = await supabase
      .from('food_basket_items')
      .insert(basketItems);

    if (itemsError) {
      console.error("Error creating basket items:", itemsError);
      return null;
    }

    return basketData.id;
  } catch (error) {
    console.error("Error saving generated basket:", error);
    return null;
  }
};
