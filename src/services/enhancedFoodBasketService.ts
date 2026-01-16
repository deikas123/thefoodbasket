import { supabase } from "@/integrations/supabase/client";

export interface EnhancedFoodBasket {
  id: string;
  name: string;
  description: string | null;
  recipe: string;
  image: string | null;
  total_price: number;
  user_id: string | null;
  is_template: boolean;
  is_shared: boolean;
  share_code: string | null;
  category: string | null;
  dietary_tags: string[];
  total_calories: number | null;
  total_protein: number | null;
  total_carbs: number | null;
  total_fat: number | null;
  prep_time: number | null;
  servings: number;
  likes_count: number;
  saves_count: number;
  created_at: string;
  updated_at: string;
}

// Generate a unique share code
const generateShareCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export const getSharedBaskets = async (): Promise<EnhancedFoodBasket[]> => {
  const { data, error } = await supabase
    .from('food_baskets')
    .select('*')
    .eq('is_shared', true)
    .order('likes_count', { ascending: false })
    .limit(50);
    
  if (error) {
    console.error('Error fetching shared baskets:', error);
    return [];
  }
  
  return data || [];
};

export const getTemplateBaskets = async (): Promise<EnhancedFoodBasket[]> => {
  const { data, error } = await supabase
    .from('food_baskets')
    .select('*')
    .eq('is_template', true)
    .order('category');
    
  if (error) {
    console.error('Error fetching template baskets:', error);
    return [];
  }
  
  return data || [];
};

export const getBasketByShareCode = async (code: string): Promise<EnhancedFoodBasket | null> => {
  const { data, error } = await supabase
    .from('food_baskets')
    .select('*')
    .eq('share_code', code)
    .single();
    
  if (error) {
    console.error('Error fetching basket by share code:', error);
    return null;
  }
  
  return data;
};

export const shareBasket = async (basketId: string): Promise<string | null> => {
  const shareCode = generateShareCode();
  
  const { error } = await supabase
    .from('food_baskets')
    .update({
      is_shared: true,
      share_code: shareCode
    })
    .eq('id', basketId);
    
  if (error) {
    console.error('Error sharing basket:', error);
    return null;
  }
  
  return shareCode;
};

export const unshareBasket = async (basketId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('food_baskets')
    .update({
      is_shared: false,
      share_code: null
    })
    .eq('id', basketId);
    
  if (error) {
    console.error('Error unsharing basket:', error);
    return false;
  }
  
  return true;
};

export const likeBasket = async (basketId: string): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  
  const { error } = await supabase
    .from('food_basket_likes')
    .insert({
      basket_id: basketId,
      user_id: user.id
    });
    
  if (error) {
    if (error.code === '23505') { // Already liked
      return true;
    }
    console.error('Error liking basket:', error);
    return false;
  }
  
  // Update likes count
  await supabase.rpc('increment_basket_likes', { basket_id: basketId });
  
  return true;
};

export const unlikeBasket = async (basketId: string): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  
  const { error } = await supabase
    .from('food_basket_likes')
    .delete()
    .eq('basket_id', basketId)
    .eq('user_id', user.id);
    
  if (error) {
    console.error('Error unliking basket:', error);
    return false;
  }
  
  return true;
};

export const saveBasket = async (basketId: string): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  
  const { error } = await supabase
    .from('food_basket_saves')
    .insert({
      basket_id: basketId,
      user_id: user.id
    });
    
  if (error) {
    if (error.code === '23505') { // Already saved
      return true;
    }
    console.error('Error saving basket:', error);
    return false;
  }
  
  return true;
};

export const unsaveBasket = async (basketId: string): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  
  const { error } = await supabase
    .from('food_basket_saves')
    .delete()
    .eq('basket_id', basketId)
    .eq('user_id', user.id);
    
  if (error) {
    console.error('Error unsaving basket:', error);
    return false;
  }
  
  return true;
};

export const getUserSavedBaskets = async (): Promise<EnhancedFoodBasket[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  
  const { data, error } = await supabase
    .from('food_basket_saves')
    .select('basket_id, food_baskets(*)')
    .eq('user_id', user.id);
    
  if (error) {
    console.error('Error fetching saved baskets:', error);
    return [];
  }
  
  return (data?.map(d => d.food_baskets as unknown as EnhancedFoodBasket).filter(Boolean) || []) as EnhancedFoodBasket[];
};

export const updateBasketNutrition = async (
  basketId: string,
  nutrition: {
    total_calories?: number;
    total_protein?: number;
    total_carbs?: number;
    total_fat?: number;
  }
): Promise<boolean> => {
  const { error } = await supabase
    .from('food_baskets')
    .update(nutrition)
    .eq('id', basketId);
    
  if (error) {
    console.error('Error updating nutrition:', error);
    return false;
  }
  
  return true;
};

export const createBasketFromTemplate = async (
  templateId: string
): Promise<string | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  
  // Get template
  const { data: template, error: templateError } = await supabase
    .from('food_baskets')
    .select('*')
    .eq('id', templateId)
    .single();
    
  if (templateError || !template) {
    console.error('Error fetching template:', templateError);
    return null;
  }
  
  // Create new basket from template
  const { data: newBasket, error: createError } = await supabase
    .from('food_baskets')
    .insert({
      name: `${template.name} (Copy)`,
      description: template.description,
      recipe: template.recipe,
      image: template.image,
      total_price: template.total_price,
      user_id: user.id,
      is_template: false,
      is_shared: false,
      category: template.category,
      dietary_tags: template.dietary_tags,
      total_calories: template.total_calories,
      total_protein: template.total_protein,
      total_carbs: template.total_carbs,
      total_fat: template.total_fat,
      prep_time: template.prep_time,
      servings: template.servings
    })
    .select()
    .single();
    
  if (createError || !newBasket) {
    console.error('Error creating basket from template:', createError);
    return null;
  }
  
  // Copy basket items
  const { data: items } = await supabase
    .from('food_basket_items')
    .select('*')
    .eq('basket_id', templateId);
    
  if (items && items.length > 0) {
    await supabase
      .from('food_basket_items')
      .insert(items.map(item => ({
        basket_id: newBasket.id,
        product_id: item.product_id,
        quantity: item.quantity
      })));
  }
  
  return newBasket.id;
};
