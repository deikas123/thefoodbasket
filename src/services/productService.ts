
import { supabase } from "@/integrations/supabase/client";
import { ProductType } from "@/types/supabase";

// Type for categories
export interface Category {
  id: string;
  name: string;
  productCount?: number;
}

export const getProducts = async (
  categoryId?: string,
  searchTerm?: string,
  minPrice?: number,
  maxPrice?: number,
  inStockOnly?: boolean
): Promise<ProductType[]> => {
  let query = supabase
    .from('products')
    .select('*');
    
  // Apply filters if provided
  if (categoryId) {
    query = query.eq('category', categoryId);
  }
  
  if (searchTerm) {
    query = query.ilike('name', `%${searchTerm}%`);
  }
  
  if (typeof minPrice === 'number') {
    query = query.gte('price', minPrice);
  }
  
  if (typeof maxPrice === 'number') {
    query = query.lte('price', maxPrice);
  }
  
  if (inStockOnly) {
    query = query.gt('stock', 0);
  }
  
  const { data, error } = await query;
    
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

// Add categories functionality
export const getCategories = async (): Promise<Category[]> => {
  // First, get unique categories
  const { data: products, error } = await supabase
    .from('products')
    .select('category');
    
  if (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
  
  // Extract unique categories and count products
  const categoryMap = new Map<string, number>();
  
  products?.forEach(product => {
    if (product.category) {
      const count = categoryMap.get(product.category) || 0;
      categoryMap.set(product.category, count + 1);
    }
  });
  
  // Convert to array of category objects
  const categories: Category[] = Array.from(categoryMap.entries()).map(([id, count]) => ({
    id,
    name: id.charAt(0).toUpperCase() + id.slice(1), // Capitalize first letter
    productCount: count
  }));
  
  return categories;
};

export const getCategoryById = async (id: string): Promise<Category | null> => {
  // Get the category and count products
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', id);
    
  if (error) {
    console.error("Error fetching category:", error);
    throw error;
  }
  
  if (!data || data.length === 0) {
    return null;
  }
  
  return {
    id,
    name: id.charAt(0).toUpperCase() + id.slice(1), // Capitalize first letter
    productCount: data.length
  };
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

// Add additional helper function for recommended products
export const getFrequentlyPurchasedTogether = async (productId: string): Promise<ProductType[]> => {
  // For now, just return other products in the same category
  const product = await getProductById(productId);
  
  if (!product || !product.category) {
    return [];
  }
  
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', product.category)
    .neq('id', productId)
    .limit(4);
    
  if (error) {
    console.error("Error fetching related products:", error);
    throw error;
  }
  
  return data || [];
};
