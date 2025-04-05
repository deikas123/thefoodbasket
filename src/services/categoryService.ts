
import { supabase } from "@/integrations/supabase/client";
import { Category } from "@/services/productService";

// Get all categories
export const getCategories = async (): Promise<Category[]> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, slug, description, image')
      .order('name');
    
    if (error) {
      console.error("Error fetching categories:", error);
      return [];
    }
    
    // Map the Supabase response to our Category type
    return data.map(category => ({
      id: category.slug, // Use slug as ID for backwards compatibility
      name: category.name,
      productCount: 0 // We'll update this count in a separate query
    }));
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
};

// Create a new category
export const createCategory = async (
  name: string, 
  description?: string, 
  image?: string
): Promise<Category | null> => {
  try {
    // Generate slug from name
    const slug = name.toLowerCase().replace(/\s+/g, "-");
    
    const { data, error } = await supabase
      .from('categories')
      .insert([
        { 
          name, 
          slug, 
          description, 
          image: image || 'https://placehold.co/600x400?text=Category'
        }
      ])
      .select()
      .single();
    
    if (error) {
      console.error("Error creating category:", error);
      return null;
    }
    
    return {
      id: data.slug,
      name: data.name,
      productCount: 0
    };
  } catch (error) {
    console.error("Error creating category:", error);
    return null;
  }
};

// Update a category
export const updateCategory = async (
  id: string, 
  updates: { name?: string; description?: string; image?: string }
): Promise<Category | null> => {
  try {
    const updateData: any = { ...updates };
    
    // If name is updated, update slug too
    if (updates.name) {
      updateData.slug = updates.name.toLowerCase().replace(/\s+/g, "-");
    }
    
    const { data, error } = await supabase
      .from('categories')
      .update(updateData)
      .eq('slug', id) // Find by the slug (which we use as ID)
      .select()
      .single();
    
    if (error) {
      console.error("Error updating category:", error);
      return null;
    }
    
    return {
      id: data.slug,
      name: data.name,
      productCount: 0
    };
  } catch (error) {
    console.error("Error updating category:", error);
    return null;
  }
};

// Delete a category
export const deleteCategory = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('slug', id); // Find by the slug (which we use as ID)
    
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

// Get category by ID
export const getCategoryById = async (id: string): Promise<Category | null> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, slug, description, image')
      .eq('slug', id) // Find by the slug (which we use as ID)
      .single();
    
    if (error) {
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

// Get all categories with product counts
export const getCategoriesWithCounts = async (): Promise<Category[]> => {
  try {
    // First get all categories
    const { data: categories, error } = await supabase
      .from('categories')
      .select('id, name, slug, description, image')
      .order('name');
    
    if (error) {
      console.error("Error fetching categories:", error);
      return [];
    }
    
    // Get product counts for each category
    const categoriesWithCounts = await Promise.all(
      categories.map(async (category) => {
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
    console.error("Error fetching categories with counts:", error);
    return [];
  }
};
