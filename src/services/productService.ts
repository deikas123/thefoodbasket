
import { supabase } from "@/integrations/supabase/client";
import { ProductType } from "@/types/supabase";
import { Product } from "@/types";
import { convertToProduct, convertToProducts } from "@/utils/typeConverters";

// Type for categories
export interface Category {
  id: string;
  name: string;
  productCount?: number;
}

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
      query = query.eq('category_id', categoryId);
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
    
    // Map the data to our ProductType
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

export const createProduct = async (product: Omit<ProductType, 'id' | 'created_at' | 'updated_at'>): Promise<ProductType> => {
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

export const updateProduct = async (id: string, product: Partial<ProductType>): Promise<ProductType> => {
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

// Add additional helper function for recommended products
export const getFrequentlyPurchasedTogether = async (productId: string): Promise<Product[]> => {
  try {
    // Get the product to find its category
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('category_id')
      .eq('id', productId)
      .single();
    
    if (productError || !product) {
      console.error("Error fetching product for recommendations:", productError);
      return [];
    }
    
    // Find other products in the same category
    const { data: relatedProducts, error } = await supabase
      .from('products')
      .select('*, categories(name, slug)')
      .eq('category_id', product.category_id)
      .neq('id', productId)
      .limit(4);
    
    if (error) {
      console.error("Error fetching related products:", error);
      return [];
    }
    
    const relatedProductTypes = relatedProducts.map(item => ({
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
    
    return convertToProducts(relatedProductTypes);
  } catch (error) {
    console.error("Error fetching related products:", error);
    return [];
  }
};
