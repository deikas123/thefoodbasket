
import { supabase } from "@/integrations/supabase/client";

// Type for categories
export interface Category {
  id: string;
  name: string;
  productCount?: number;
  description?: string;
  image?: string;
  parentId?: string;
  subcategories?: Category[];
}

// Get all categories with their product counts and hierarchy
export const getCategories = async (): Promise<Category[]> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, slug, description, image, parent_id')
      .order('name');
    
    if (error) {
      console.error("Error fetching categories:", error);
      return [];
    }
    
    // Get product counts for all categories in one query
    const { data: productCounts, error: countError } = await supabase
      .from('products')
      .select('category_id')
      .then(({ data, error }) => {
        if (error) return { data: null, error };
        const counts: Record<string, number> = {};
        data?.forEach(product => {
          counts[product.category_id] = (counts[product.category_id] || 0) + 1;
        });
        return { data: counts, error: null };
      });
    
    if (countError) {
      console.error("Error counting products:", countError);
    }
    
    // Transform categories to use slug as ID and add product counts
    const categoriesWithCounts = data.map((category) => ({
      id: category.slug, // Use slug as ID for backwards compatibility
      name: category.name,
      description: category.description,
      image: category.image,
      parentId: category.parent_id,
      productCount: productCounts?.[category.id] || 0
    }));
    
    // Build hierarchy - first get root categories, then add subcategories
    const rootCategories = categoriesWithCounts.filter(cat => !cat.parentId);
    const buildHierarchy = (categories: Category[]): Category[] => {
      return categories.map(category => ({
        ...category,
        subcategories: categoriesWithCounts.filter(sub => sub.parentId === category.id)
      }));
    };
    
    return buildHierarchy(rootCategories);
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
      .select('id, name, slug, description, image, parent_id')
      .eq('slug', id)
      .maybeSingle();
    
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
    
    // Get subcategories
    const { data: subcategoriesData } = await supabase
      .from('categories')
      .select('id, name, slug, description, image, parent_id')
      .eq('parent_id', data.id);
    
    const subcategories = await Promise.all(
      (subcategoriesData || []).map(async (subcat) => {
        const { count: subCount } = await supabase
          .from('products')
          .select('id', { count: 'exact', head: true })
          .eq('category_id', subcat.id);
        
        return {
          id: subcat.slug,
          name: subcat.name,
          description: subcat.description,
          image: subcat.image,
          parentId: subcat.parent_id,
          productCount: subCount || 0
        };
      })
    );
    
    return {
      id: data.slug,
      name: data.name,
      description: data.description,
      image: data.image,
      parentId: data.parent_id,
      productCount: count || 0,
      subcategories
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
  image: string,
  parentId?: string
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
        image: image || null,
        parent_id: parentId || null
      })
      .select('id, name, slug, description, image, parent_id')
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
      parentId: data.parent_id,
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
      .select('id, name, slug, description, image, parent_id')
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
      parentId: data.parent_id,
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
