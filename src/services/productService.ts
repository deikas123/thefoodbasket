
import { supabase } from "@/integrations/supabase/client";
import { ProductType } from "@/types/supabase";

export const getProducts = async (): Promise<ProductType[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*');
    
  if (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
  
  return data || [];
};

export const getFeaturedProducts = async (): Promise<ProductType[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('featured', true);
    
  if (error) {
    console.error("Error fetching featured products:", error);
    throw error;
  }
  
  return data || [];
};

export const getProductsByCategory = async (category: string): Promise<ProductType[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', category);
    
  if (error) {
    console.error("Error fetching products by category:", error);
    throw error;
  }
  
  return data || [];
};

export const getProductById = async (id: string): Promise<ProductType | null> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) {
    if (error.code === 'PGRST116') {
      // Product not found
      return null;
    }
    console.error("Error fetching product:", error);
    throw error;
  }
  
  return data;
};

export const createProduct = async (product: Omit<ProductType, 'id' | 'created_at' | 'updated_at'>): Promise<ProductType> => {
  const { data, error } = await supabase
    .from('products')
    .insert([product])
    .select()
    .single();
    
  if (error) {
    console.error("Error creating product:", error);
    throw error;
  }
  
  return data;
};

export const updateProduct = async (id: string, product: Partial<ProductType>): Promise<ProductType> => {
  const { data, error } = await supabase
    .from('products')
    .update(product)
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    console.error("Error updating product:", error);
    throw error;
  }
  
  return data;
};

export const deleteProduct = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);
    
  if (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
};
