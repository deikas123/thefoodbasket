
import { supabase } from "@/integrations/supabase/client";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  productCount?: number;
  created_at: string;
  updated_at: string;
}

export const getCategories = async (): Promise<Category[]> => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');
  
  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
  
  return data || [];
};

export const getCategoriesWithCounts = async (): Promise<Category[]> => {
  const { data, error } = await supabase
    .from('categories')
    .select(`
      *,
      products (count)
    `)
    .order('name');
  
  if (error) {
    console.error('Error fetching categories with counts:', error);
    return [];
  }
  
  return (data || []).map(category => ({
    ...category,
    productCount: category.products?.[0]?.count || 0
  }));
};

export const getCategoryById = async (slugOrId: string): Promise<Category | null> => {
  // Try to find by slug first, then by ID
  let query = supabase
    .from('categories')
    .select('*');
  
  // Check if the parameter looks like a UUID
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId);
  
  if (isUUID) {
    query = query.eq('id', slugOrId);
  } else {
    query = query.eq('slug', slugOrId);
  }
  
  const { data, error } = await query.single();
  
  if (error) {
    console.error('Error fetching category:', error);
    return null;
  }
  
  return data;
};

export const createCategory = async (
  name: string,
  description?: string,
  image?: string
): Promise<Category | null> => {
  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  
  const { data, error } = await supabase
    .from('categories')
    .insert([
      {
        name,
        slug,
        description,
        image
      }
    ])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating category:', error);
    return null;
  }
  
  return data;
};

export const updateCategory = async (
  id: string,
  updates: Partial<Category>
): Promise<Category | null> => {
  // Generate slug if name is being updated
  if (updates.name) {
    updates.slug = updates.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }
  
  const { data, error } = await supabase
    .from('categories')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating category:', error);
    return null;
  }
  
  return data;
};

export const deleteCategory = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting category:', error);
    return false;
  }
  
  return true;
};
