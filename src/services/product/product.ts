
import { supabase } from "@/integrations/supabase/client";
import { ProductType } from "@/types/supabase";
import { getProductTags } from "./tagService";

// Get all products with optional filtering
export const getProducts = async (
  categoryId?: string,
  searchTerm?: string,
  minPrice?: number,
  maxPrice?: number,
  inStockOnly?: boolean
): Promise<ProductType[]> => {
  try {
    let query = supabase
      .from('products')
      .select('*, categories(name, slug)');
    
    // Apply filters if provided
    if (categoryId) {
      // Check if categoryId is actually a UUID (for direct category ID filtering)
      // or if it's a slug and we need to convert it
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      
      if (uuidRegex.test(categoryId)) {
        // It's a UUID, use it directly
        query = query.eq('category_id', categoryId);
      } else {
        // It might be a slug, first get the category ID
        const { data: categoryData, error: categoryError } = await supabase
          .from('categories')
          .select('id')
          .eq('slug', categoryId)
          .single();
        
        if (!categoryError && categoryData) {
          query = query.eq('category_id', categoryData.id);
        }
      }
    }
    
    if (searchTerm) {
      const term = `%${searchTerm.toLowerCase()}%`;
      query = query.or(`name.ilike.${term},description.ilike.${term}`);
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
      return [];
    }
    
    if (!data) {
      return [];
    }
    
    // Map the data to our ProductType, ensure we handle potential null values
    return data.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      image: item.image,
      category_id: item.category_id,
      stock: item.stock,
      featured: item.featured,
      rating: item.rating,
      num_reviews: item.num_reviews,
      discount_percentage: item.discount_percentage,
      created_at: item.created_at,
      updated_at: item.updated_at
    }));
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
};

// Alias for backwards compatibility with components using getAllProducts
export const getAllProducts = getProducts;

export const getFeaturedProducts = async (): Promise<ProductType[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name, slug)')
      .eq('featured', true);
    
    if (error) {
      console.error("Error fetching featured products:", error);
      return [];
    }
    
    if (!data) {
      return [];
    }
    
    return data.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      image: item.image,
      category_id: item.category_id,
      stock: item.stock,
      featured: item.featured,
      rating: item.rating,
      num_reviews: item.num_reviews,
      discount_percentage: item.discount_percentage,
      created_at: item.created_at,
      updated_at: item.updated_at
    }));
  } catch (error) {
    console.error("Error fetching featured products:", error);
    return [];
  }
};

export const getProductsByCategory = async (category: string): Promise<ProductType[]> => {
  try {
    // Get the category id from the slug
    const { data: categoryData, error: categoryError } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', category)
      .single();
    
    if (categoryError || !categoryData) {
      console.error("Error fetching category:", categoryError);
      return [];
    }
    
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name, slug)')
      .eq('category_id', categoryData.id);
    
    if (error) {
      console.error("Error fetching products by category:", error);
      return [];
    }
    
    return data.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      image: item.image,
      category_id: item.category_id,
      stock: item.stock,
      featured: item.featured,
      rating: item.rating,
      num_reviews: item.num_reviews,
      discount_percentage: item.discount_percentage,
      created_at: item.created_at,
      updated_at: item.updated_at
    }));
  } catch (error) {
    console.error("Error fetching products by category:", error);
    return [];
  }
};

export const getProductById = async (id: string): Promise<ProductType | null> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name, slug)')
      .eq('id', id)
      .single();
    
    if (error || !data) {
      console.error("Error fetching product:", error);
      return null;
    }
    
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      price: data.price,
      image: data.image,
      category_id: data.category_id,
      stock: data.stock,
      featured: data.featured,
      rating: data.rating,
      num_reviews: data.num_reviews,
      discount_percentage: data.discount_percentage,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
};

export const createProduct = async (product: Omit<ProductType, 'id' | 'created_at' | 'updated_at'>): Promise<ProductType | null> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .insert({
        name: product.name,
        description: product.description,
        price: product.price,
        image: product.image,
        category_id: product.category_id,
        stock: product.stock,
        featured: product.featured,
        rating: product.rating,
        num_reviews: product.num_reviews,
        discount_percentage: product.discount_percentage
      })
      .select('*, categories(name, slug)')
      .single();
    
    if (error || !data) {
      throw error;
    }
    
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      price: data.price,
      image: data.image,
      category_id: data.category_id,
      stock: data.stock,
      featured: data.featured,
      rating: data.rating,
      num_reviews: data.num_reviews,
      discount_percentage: data.discount_percentage,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
};

export const updateProduct = async (id: string, product: Partial<ProductType>): Promise<ProductType | null> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .update({
        name: product.name,
        description: product.description,
        price: product.price,
        image: product.image,
        category_id: product.category_id,
        stock: product.stock,
        featured: product.featured,
        rating: product.rating,
        num_reviews: product.num_reviews,
        discount_percentage: product.discount_percentage
      })
      .eq('id', id)
      .select('*, categories(name, slug)')
      .single();
    
    if (error || !data) {
      throw error;
    }
    
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      price: data.price,
      image: data.image,
      category_id: data.category_id,
      stock: data.stock,
      featured: data.featured,
      rating: data.rating,
      num_reviews: data.num_reviews,
      discount_percentage: data.discount_percentage,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
};

export const deleteProduct = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
};

// Function to get category by ID
export const getCategoryById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', id)
      .single();
    
    if (error) {
      console.error("Error fetching category:", error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error("Error fetching category:", error);
    return null;
  }
};

// Import from recommendationService for backwards compatibility
export { getFrequentlyPurchasedTogether } from './recommendationService';
export { getCategories } from './categoryService';
