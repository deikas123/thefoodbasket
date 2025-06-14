
import { supabase } from "@/integrations/supabase/client";

// Type for categories
export interface Category {
  id: string;
  name: string;
  productCount?: number;
  description?: string;
  image?: string;
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

// Alias for backwards compatibility to fix the error
export const getCategoriesWithCounts = getCategories;

export const getCategoryById = async (id: string): Promise<Category | null> => {
  try {
    // Get the category by slug
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, slug, description, image')
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
      description: data.description,
      image: data.image,
      productCount: count || 0
    };
  } catch (error) {
    console.error("Error fetching category:", error);
    return null;
  }
};

// Create a new category
export const createCategory = async (
  name: string, 
  description: string, 
  image: string
): Promise<Category | null> => {
  try {
    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    const { data, error } = await supabase
      .from('categories')
      .insert({ 
        name, 
        slug,
        description: description || null,
        image: image || null
      })
      .select('id, name, slug, description, image')
      .single();
    
    if (error) {
      console.error("Error creating category:", error);
      return null;
    }
    
    return {
      id: data.slug,
      name: data.name,
      description: data.description,
      image: data.image,
      productCount: 0
    };
  } catch (error) {
    console.error("Error creating category:", error);
    return null;
  }
};

// Update an existing category
export const updateCategory = async (
  id: string, 
  updates: Partial<Category>
): Promise<Category | null> => {
  try {
    // First get the original category to find the original DB id
    const { data: categoryData, error: categoryError } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', id)
      .single();
    
    if (categoryError || !categoryData) {
      console.error("Error finding category to update:", categoryError);
      return null;
    }
    
    const updateData: any = {};
    
    if (updates.name) updateData.name = updates.name;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.image !== undefined) updateData.image = updates.image;
    
    // If name changed, update slug too
    if (updates.name) {
      updateData.slug = updates.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }
    
    const { data, error } = await supabase
      .from('categories')
      .update(updateData)
      .eq('id', categoryData.id)
      .select('id, name, slug, description, image')
      .single();
    
    if (error) {
      console.error("Error updating category:", error);
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
      description: data.description,
      image: data.image,
      productCount: count || 0
    };
  } catch (error) {
    console.error("Error updating category:", error);
    return null;
  }
};

// Delete a category
export const deleteCategory = async (id: string): Promise<boolean> => {
  try {
    // First get the original category to find the original DB id
    const { data: categoryData, error: categoryError } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', id)
      .single();
    
    if (categoryError || !categoryData) {
      console.error("Error finding category to delete:", categoryError);
      return false;
    }
    
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryData.id);
    
    if (error) {
      console.error("Error deleting category:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error deleting category:", error);
    return false;
  }
};
