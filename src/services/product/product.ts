import { supabase } from "@/integrations/supabase/client";
import { ProductType } from "@/types/supabase";
import { getProductTags } from "./tagService";

// Default limit for initial page load - optimized for performance
const DEFAULT_LIMIT = 24;

// Get all products with optional filtering and pagination
export const getProducts = async (
  categoryId?: string,
  searchTerm?: string,
  minPrice?: number,
  maxPrice?: number,
  inStockOnly?: boolean,
  limit: number = DEFAULT_LIMIT,
  offset: number = 0
): Promise<ProductType[]> => {
  try {
    // Build a simpler, more efficient query
    let query = supabase
      .from('products')
      .select('id, name, description, price, image, stock, featured, rating, num_reviews, discount_percentage, created_at, updated_at, category_id, categories!inner(name, slug)');
    
    // Apply filters
    if (searchTerm && searchTerm.trim()) {
      const term = `%${searchTerm.trim().toLowerCase()}%`;
      query = query.or(`name.ilike.${term},description.ilike.${term}`);
    } else if (categoryId && categoryId.trim()) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      
      if (uuidRegex.test(categoryId)) {
        query = query.eq('category_id', categoryId);
      } else {
        // Filter by category slug through the join
        query = query.eq('categories.slug', categoryId);
      }
    }
    
    if (typeof minPrice === 'number' && minPrice > 0) {
      query = query.gte('price', minPrice);
    }
    
    if (typeof maxPrice === 'number' && maxPrice < 50000) {
      query = query.lte('price', maxPrice);
    }
    
    if (inStockOnly) {
      query = query.gt('stock', 0);
    }
    
    // Add pagination and ordering
    query = query
      .order('featured', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    const { data, error } = await query;
    
    if (error) {
      console.error("Error fetching products:", error);
      return [];
    }
    
    if (!data || data.length === 0) {
      return [];
    }
    
    // Map the data to our ProductType
    return data.map(item => {
      const cat = item.categories;
      const categorySlug = Array.isArray(cat) ? cat[0]?.slug : (cat as { slug?: string })?.slug || '';
      return {
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        image: item.image,
        category: categorySlug,
        stock: item.stock,
        featured: item.featured,
        rating: item.rating,
        num_reviews: item.num_reviews,
        numReviews: item.num_reviews,
        discountPercentage: item.discount_percentage,
        created_at: item.created_at,
        updated_at: item.updated_at
      };
    });
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
      category: item.categories?.slug || '',
      stock: item.stock,
      featured: item.featured,
      rating: item.rating,
      num_reviews: item.num_reviews,
      numReviews: item.num_reviews,
      discountPercentage: item.discount_percentage,
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
      category: item.categories?.slug || '',
      stock: item.stock,
      featured: item.featured,
      rating: item.rating,
      num_reviews: item.num_reviews,
      numReviews: item.num_reviews,
      discountPercentage: item.discount_percentage,
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
      category: data.categories?.slug || '',
      stock: data.stock,
      featured: data.featured,
      rating: data.rating,
      num_reviews: data.num_reviews,
      numReviews: data.num_reviews,
      discountPercentage: data.discount_percentage,
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
    // Get category_id from the slug
    const { data: categoryData, error: categoryError } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', product.category)
      .single();
    
    if (categoryError || !categoryData) {
      throw new Error(`Category with slug ${product.category} not found`);
    }
    
    const { data, error } = await supabase
      .from('products')
      .insert({
        name: product.name,
        description: product.description,
        price: product.price,
        image: product.image,
        category_id: categoryData.id,
        stock: product.stock,
        featured: product.featured,
        rating: product.rating,
        num_reviews: product.numReviews,
        discount_percentage: product.discountPercentage
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
      category: data.categories?.slug || '',
      stock: data.stock,
      featured: data.featured,
      rating: data.rating,
      num_reviews: data.num_reviews,
      numReviews: data.num_reviews,
      discountPercentage: data.discount_percentage,
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
    let categoryId = undefined;
    
    // If category is being updated, get the category_id
    if (product.category) {
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', product.category)
        .single();
      
      if (categoryError || !categoryData) {
        throw new Error(`Category with slug ${product.category} not found`);
      }
      
      categoryId = categoryData.id;
    }
    
    const { data, error } = await supabase
      .from('products')
      .update({
        name: product.name,
        description: product.description,
        price: product.price,
        image: product.image,
        category_id: categoryId,
        stock: product.stock,
        featured: product.featured,
        rating: product.rating,
        num_reviews: product.numReviews,
        discount_percentage: product.discountPercentage
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
      category: data.categories?.slug || '',
      stock: data.stock,
      featured: data.featured,
      rating: data.rating,
      num_reviews: data.num_reviews,
      numReviews: data.num_reviews,
      discountPercentage: data.discount_percentage,
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
