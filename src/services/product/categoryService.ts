
import { supabase } from "@/integrations/supabase/client";

// Type for categories
export interface Category {
  id: string;
  name: string;
  productCount?: number;
}

// Get all categories with their product counts
export const getCategories = async (): Promise<Category[]> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, slug');
    
    if (error) {
      console.error("Error fetching categories:", error);
      return [];
    }
    
    // Get product counts for each category
    const categoriesWithCounts = await Promise.all(
      data.map(async (category) => {
        const { count, error: countError } = await supabase
          .from('products')
          .select('id', { count: 'exact', head: true })
          .eq('category_id', category.id);
        
        if (countError) {
          console.error(`Error counting products for category ${category.name}:`, countError);
        }
        
        return {
          id: category.slug, // Use slug as ID for backwards compatibility
          name: category.name,
          productCount: count || 0
        };
      })
    );
    
    return categoriesWithCounts;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
};

export const getCategoryById = async (id: string): Promise<Category | null> => {
  try {
    // Get the category by slug
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, slug')
      .eq('slug', id)
      .single();
    
    if (error || !data) {
      console.error("Error fetching category:", error);
      return null;
    }
    
    // Get product count for this category
    const { count, error: countError } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('category_id', data.id);
    
    if (countError) {
      console.error("Error counting products:", countError);
    }
    
    return {
      id: data.slug,
      name: data.name,
      productCount: count || 0
    };
  } catch (error) {
    console.error("Error fetching category:", error);
    return null;
  }
};
