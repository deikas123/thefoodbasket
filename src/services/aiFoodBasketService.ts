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

    // Filter products that are actually in stock (stock > 0)
    const inStockProducts = products.filter(product => 
      product.stock > 0 && 
      typeof product.stock === 'number' && 
      product.stock >= 1
    );
    
    console.log(`Filtered ${inStockProducts.length} in-stock products from ${products.length} total products`);
    
    if (inStockProducts.length === 0) {
      console.warn("No products currently in stock for basket generation");
      return [];
    }
    
    // Generate baskets using AI logic with only in-stock products
    const baskets = await generateSmartBaskets(inStockProducts, criteria);
    
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
        description: "Start your day right with fresh fruits, whole grains, and protein - all items in stock!",
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
        description: "Complete ingredients for a delicious home-cooked family meal - ready to ship!",
        recipe: generateDinnerRecipe(dinnerProducts),
        products: dinnerProducts,
        totalPrice: calculateTotalPrice(dinnerProducts)
      });
    }
  }
  
  // Fresh fruit basket with reasonable pricing
  const fruitProducts = selectProductsForMeal(products, 'fruit', criteria.maxPrice);
  if (fruitProducts.length > 0) {
    baskets.push({
      name: "Assorted Fruits",
      description: "Fresh seasonal fruits perfect for healthy snacking - all items in stock!",
      recipe: generateFruitRecipe(fruitProducts),
      products: fruitProducts,
      totalPrice: calculateTotalPrice(fruitProducts)
    });
  }
  
  // Quick meal basket
  const quickMealProducts = selectProductsForMeal(products, 'quick', criteria.maxPrice);
  if (quickMealProducts.length > 0) {
    baskets.push({
      name: "Quick & Easy Meal",
      description: "Perfect for busy weeknights - ready in under 30 minutes with available stock",
      recipe: generateQuickMealRecipe(quickMealProducts),
      products: quickMealProducts,
      totalPrice: calculateTotalPrice(quickMealProducts)
    });
  }
  
  // Healthy snack basket
  const snackProducts = selectProductsForMeal(products, 'snack', criteria.maxPrice);
  if (snackProducts.length > 0) {
    baskets.push({
      name: "Healthy Snack Pack",
      description: "Nutritious snacks for between meals - all freshly stocked",
      recipe: generateSnackRecipe(snackProducts),
      products: snackProducts,
      totalPrice: calculateTotalPrice(snackProducts)
    });
  }
  
  return baskets.filter(basket => !criteria.maxPrice || basket.totalPrice <= criteria.maxPrice);
};

const selectProductsForMeal = (products: Product[], mealType: string, maxPrice?: number): { product: Product; quantity: number }[] => {
  const selected: { product: Product; quantity: number }[] = [];
  let currentTotal = 0;
  
  // Define meal type preferences with reasonable quantities
  const mealPreferences = {
    breakfast: ['fruit', 'cereal', 'milk', 'bread', 'egg', 'yogurt', 'honey', 'oats', 'banana', 'orange'],
    dinner: ['meat', 'chicken', 'beef', 'fish', 'vegetable', 'rice', 'pasta', 'sauce', 'onion', 'tomato'],
    quick: ['pasta', 'sauce', 'cheese', 'bread', 'salad', 'noodles', 'soup'],
    snack: ['nuts', 'crackers', 'cheese', 'yogurt', 'berries', 'apple', 'carrot'],
    fruit: ['apple', 'orange', 'banana', 'grape', 'berry', 'fruit', 'mango', 'pear', 'tangerine']
  };
  
  const preferences = mealPreferences[mealType as keyof typeof mealPreferences] || [];
  const targetPrice = maxPrice || (mealType === 'fruit' ? 25 : 50);
  
  // Try to include products that match meal preferences and are in stock
  for (const preference of preferences) {
    const matchingProducts = products.filter(p => 
      p.name.toLowerCase().includes(preference) && 
      !selected.some(s => s.product.id === p.id) &&
      p.stock > 0
    );
    
    if (matchingProducts.length > 0) {
      const product = matchingProducts[Math.floor(Math.random() * matchingProducts.length)];
      // Use reasonable quantities, especially for fruits
      const maxQuantity = Math.min(product.stock, mealType === 'fruit' ? 2 : 3);
      const quantity = Math.max(1, Math.min(maxQuantity, mealType === 'fruit' ? 2 : Math.ceil(Math.random() * maxQuantity)));
      const itemTotal = product.price * quantity;
      
      if (currentTotal + itemTotal <= targetPrice) {
        selected.push({ product, quantity });
        currentTotal += itemTotal;
        
        if (selected.length >= (mealType === 'fruit' ? 4 : 5)) break;
      }
    }
  }
  
  // Fill remaining space with random in-stock products if needed and under budget
  while (selected.length < 3 && products.length > selected.length && currentTotal < targetPrice * 0.8) {
    const availableProducts = products.filter(p => 
      !selected.some(s => s.product.id === p.id) && 
      p.stock > 0
    );
    
    if (availableProducts.length === 0) break;
    
    const randomProduct = availableProducts[Math.floor(Math.random() * availableProducts.length)];
    const maxQuantity = Math.min(randomProduct.stock, 2);
    const quantity = Math.max(1, Math.ceil(Math.random() * maxQuantity));
    const itemTotal = randomProduct.price * quantity;
    
    if (currentTotal + itemTotal <= targetPrice) {
      selected.push({ product: randomProduct, quantity });
      currentTotal += itemTotal;
    } else {
      break;
    }
  }
  
  return selected;
};

const generateBreakfastRecipe = (products: { product: Product; quantity: number }[]): string => {
  return `Delicious Breakfast Recipe\n\nIngredients (All In Stock):\n${products.map(p => `- ${p.quantity}x ${p.product.name} (${p.product.stock} available)`).join('\n')}\n\nInstructions:\n1. Prepare all fresh ingredients\n2. Combine as desired for a nutritious breakfast\n3. Enjoy your healthy start to the day!\n\nServing suggestion: Perfect for 2-4 people depending on portions.`;
};

const generateDinnerRecipe = (products: { product: Product; quantity: number }[]): string => {
  return `Family Dinner Recipe\n\nIngredients (Ready to Ship):\n${products.map(p => `- ${p.quantity}x ${p.product.name} (${p.product.stock} in stock)`).join('\n')}\n\nInstructions:\n1. Prep all ingredients according to package directions\n2. Cook proteins first, then add vegetables\n3. Season to taste and serve hot\n4. Enjoy your family meal!\n\nCooking time: Approximately 45-60 minutes\nServes: 4-6 people`;
};

const generateQuickMealRecipe = (products: { product: Product; quantity: number }[]): string => {
  return `Quick & Easy Recipe\n\nIngredients (Available Now):\n${products.map(p => `- ${p.quantity}x ${p.product.name} (Stock: ${p.product.stock})`).join('\n')}\n\nInstructions:\n1. Heat and prepare according to package directions\n2. Combine ingredients in a simple, delicious way\n3. Ready in under 30 minutes!\n\nPerfect for busy weeknights when you need something fast and satisfying.`;
};

const generateSnackRecipe = (products: { product: Product; quantity: number }[]): string => {
  return `Healthy Snack Mix\n\nIngredients (Fresh Stock):\n${products.map(p => `- ${p.quantity}x ${p.product.name} (${p.product.stock} available)`).join('\n')}\n\nInstructions:\n1. Wash and prepare fresh items\n2. Portion into convenient snack sizes\n3. Store properly for freshness\n4. Enjoy throughout the day!\n\nPerfect for healthy snacking between meals.`;
};

const generateFruitRecipe = (products: { product: Product; quantity: number }[]): string => {
  return `Fresh Fruit Selection\n\nIngredients (All Fresh & In Stock):\n${products.map(p => `- ${p.quantity}x ${p.product.name} (${p.product.stock} available)`).join('\n')}\n\nServing Suggestions:\n1. Wash all fruits thoroughly\n2. Store in refrigerator for freshness\n3. Perfect for healthy snacking, breakfast additions, or smoothies\n4. Great source of vitamins and natural energy\n\nEnjoy fresh and healthy!`;
};

const calculateTotalPrice = (products: { product: Product; quantity: number }[]): number => {
  const total = products.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  console.log('Basket total calculation:', products.map(p => `${p.product.name}: ${p.product.price} x ${p.quantity} = ${p.product.price * p.quantity}`), 'Total:', total);
  return Math.round(total * 100) / 100;
};

export const saveGeneratedBasket = async (basket: GeneratedBasket): Promise<string | null> => {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error("User must be logged in to save baskets");
      return null;
    }
    
    // Create the food basket
    const { data: basketData, error: basketError } = await supabase
      .from('food_baskets')
      .insert({
        name: basket.name,
        description: basket.description,
        recipe: basket.recipe,
        total_price: basket.totalPrice,
        image: basket.products[0]?.product.image || null,
        user_id: user.id
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
