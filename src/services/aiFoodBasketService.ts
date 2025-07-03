import { supabase } from "@/integrations/supabase/client";
import { convertProductTypeToProduct } from "@/utils/productHelpers";

interface Ingredient {
  id: string;
  name: string;
  quantity: string;
  unit: string;
}

interface AIFoodBasket {
  name: string;
  description: string;
  recipe: string;
  ingredients: Ingredient[];
  estimatedCost: number;
  servings: number;
  prepTime: number;
  cookTime: number;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
}

// Mock data for testing purposes
const mockIngredients = [
  { id: "1", name: "Tomato", quantity: "2", unit: "pieces" },
  { id: "2", name: "Cucumber", quantity: "1", unit: "piece" },
  { id: "3", name: "Onion", quantity: "0.5", unit: "piece" },
  { id: "4", name: "Olive Oil", quantity: "2", unit: "tablespoons" },
  { id: "5", name: "Lemon", quantity: "0.5", unit: "piece" },
];

// Mock function to simulate AI-generated ingredients
export const generateAIIngredients = async (preferences: string[]): Promise<Ingredient[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  return mockIngredients;
};

export const getFoodBasketProducts = async (ingredientNames: string[]): Promise<any[]> => {
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .in('name', ingredientNames.map(name => name.toLowerCase()));

    if (error) {
      console.error('Error fetching food basket products:', error);
      return [];
    }

    // Convert ProductType to Product using the helper function
    return products.map(product => convertProductTypeToProduct(product));
  } catch (error) {
    console.error('Error in getFoodBasketProducts:', error);
    return [];
  }
};

// Mock function to simulate AI-generated food baskets
export const generateAIFoodBasket = async (preferences: string[]): Promise<AIFoodBasket> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const mockBaskets: AIFoodBasket[] = [
    {
      name: "Mediterranean Quinoa Bowl",
      description: "A healthy and colorful bowl packed with Mediterranean flavors",
      recipe: "Cook quinoa according to package instructions. While quinoa cooks, dice tomatoes, cucumber, and red onion. Crumble feta cheese. Mix olive oil, lemon juice, salt, and pepper for dressing. Combine all ingredients in a bowl and toss with dressing. Garnish with fresh herbs.",
      ingredients: [
        { id: "1", name: "Quinoa", quantity: "1", unit: "cup" },
        { id: "2", name: "Cherry Tomatoes", quantity: "1", unit: "cup" },
        { id: "3", name: "Cucumber", quantity: "1", unit: "large" },
        { id: "4", name: "Feta Cheese", quantity: "4", unit: "oz" },
        { id: "5", name: "Olive Oil", quantity: "3", unit: "tbsp" },
        { id: "6", name: "Lemon", quantity: "1", unit: "whole" }
      ],
      estimatedCost: 15.99,
      servings: 4,
      prepTime: 15,
      cookTime: 20,
      difficulty: 'easy',
      tags: ['Mediterranean', 'Healthy', 'Vegetarian', 'Quick']
    },
    {
      name: "Spicy Thai Basil Stir Fry",
      description: "A vibrant and spicy stir fry with fresh Thai basil and vegetables",
      recipe: "Heat oil in a wok over high heat. Add garlic and chilies, stir for 30 seconds. Add protein and cook until done. Add vegetables and stir-fry for 2-3 minutes. Add sauce mixture and Thai basil, toss quickly. Serve over rice.",
      ingredients: [
        { id: "7", name: "Thai Basil", quantity: "1", unit: "bunch" },
        { id: "8", name: "Chicken Breast", quantity: "1", unit: "lb" },
        { id: "9", name: "Bell Peppers", quantity: "2", unit: "whole" },
        { id: "10", name: "Soy Sauce", quantity: "3", unit: "tbsp" },
        { id: "11", name: "Fish Sauce", quantity: "2", unit: "tbsp" },
        { id: "12", name: "Jasmine Rice", quantity: "2", unit: "cups" }
      ],
      estimatedCost: 18.50,
      servings: 4,
      prepTime: 20,
      cookTime: 15,
      difficulty: 'medium',
      tags: ['Thai', 'Spicy', 'Stir Fry', 'Asian']
    }
  ];
  
  // Return a random basket based on preferences
  return mockBaskets[Math.floor(Math.random() * mockBaskets.length)];
};

// Get all available food baskets
export const getAllFoodBaskets = async () => {
  try {
    const { data: baskets, error } = await supabase
      .from('food_baskets')
      .select(`
        *,
        food_basket_items (
          quantity,
          product_id
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching food baskets:', error);
      return [];
    }

    return baskets || [];
  } catch (error) {
    console.error('Error in getAllFoodBaskets:', error);
    return [];
  }
};

export const getFoodBasketById = async (id: string) => {
  try {
    const { data: basket, error } = await supabase
      .from('food_baskets')
      .select(`
        *,
        food_basket_items (
          quantity,
          product_id
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching food basket:', error);
      return null;
    }

    return basket;
  } catch (error) {
    console.error('Error in getFoodBasketById:', error);
    return null;
  }
};
