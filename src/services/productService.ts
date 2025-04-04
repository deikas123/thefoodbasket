import { supabase } from "@/integrations/supabase/client";
import { ProductType } from "@/types/supabase";
import { products as mockProducts } from "@/data/products";

// Type for categories
export interface Category {
  id: string;
  name: string;
  productCount?: number;
}

// Because the Supabase tables are not properly set up yet, we'll use mock data
// but keep the API structure consistent
export const getProducts = async (
  categoryId?: string,
  searchTerm?: string,
  minPrice?: number,
  maxPrice?: number,
  inStockOnly?: boolean
): Promise<ProductType[]> => {
  try {
    // Use mock data from data/products.ts
    let filteredProducts = mockProducts.map(p => ({
      ...p,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      num_reviews: p.numReviews,
    })) as unknown as ProductType[];
    
    // Apply filters if provided
    if (categoryId) {
      filteredProducts = filteredProducts.filter(p => p.category === categoryId);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredProducts = filteredProducts.filter(p => 
        p.name.toLowerCase().includes(term) || 
        p.description.toLowerCase().includes(term)
      );
    }
    
    if (typeof minPrice === 'number') {
      filteredProducts = filteredProducts.filter(p => p.price >= minPrice);
    }
    
    if (typeof maxPrice === 'number') {
      filteredProducts = filteredProducts.filter(p => p.price <= maxPrice);
    }
    
    if (inStockOnly) {
      filteredProducts = filteredProducts.filter(p => p.stock > 0);
    }
    
    return filteredProducts;
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
};

// Alias for backwards compatibility with components using getAllProducts
export const getAllProducts = getProducts;

export const getFeaturedProducts = async (): Promise<ProductType[]> => {
  try {
    // Use mock data
    const featuredProducts = mockProducts
      .filter(p => p.featured)
      .map(p => ({
        ...p,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        num_reviews: p.numReviews,
      })) as unknown as ProductType[];
    
    return featuredProducts;
  } catch (error) {
    console.error("Error fetching featured products:", error);
    return [];
  }
};

export const getProductsByCategory = async (category: string): Promise<ProductType[]> => {
  try {
    // Use mock data
    const categoryProducts = mockProducts
      .filter(p => p.category === category)
      .map(p => ({
        ...p,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        num_reviews: p.numReviews,
      })) as unknown as ProductType[];
    
    return categoryProducts;
  } catch (error) {
    console.error("Error fetching products by category:", error);
    return [];
  }
};

export const getProductById = async (id: string): Promise<ProductType | null> => {
  try {
    // Use mock data
    const product = mockProducts.find(p => p.id === id);
    
    if (!product) {
      return null;
    }
    
    return {
      ...product,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      num_reviews: product.numReviews,
    } as unknown as ProductType;
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
};

// Add categories functionality
export const getCategories = async (): Promise<Category[]> => {
  try {
    // Extract unique categories from mock data
    const categoryMap = new Map<string, number>();
    
    mockProducts.forEach(product => {
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
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
};

export const getCategoryById = async (id: string): Promise<Category | null> => {
  try {
    // Get the category and count products from mock data
    const categoryProducts = mockProducts.filter(p => p.category === id);
    
    if (categoryProducts.length === 0) {
      return null;
    }
    
    return {
      id,
      name: id.charAt(0).toUpperCase() + id.slice(1), // Capitalize first letter
      productCount: categoryProducts.length
    };
  } catch (error) {
    console.error("Error fetching category:", error);
    return null;
  }
};

export const createProduct = async (product: Omit<ProductType, 'id' | 'created_at' | 'updated_at'>): Promise<ProductType> => {
  // This is a placeholder that would normally interact with Supabase
  const newProduct = {
    ...product,
    id: `temp-${Math.random().toString(36).substring(2, 11)}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  return newProduct as ProductType;
};

export const updateProduct = async (id: string, product: Partial<ProductType>): Promise<ProductType> => {
  // This is a placeholder that would normally interact with Supabase
  const existingProduct = await getProductById(id);
  
  if (!existingProduct) {
    throw new Error(`Product with id ${id} not found`);
  }
  
  const updatedProduct = {
    ...existingProduct,
    ...product,
    updated_at: new Date().toISOString()
  };
  
  return updatedProduct;
};

export const deleteProduct = async (id: string): Promise<void> => {
  // This is a placeholder that would normally interact with Supabase
  console.log(`Product with id ${id} would be deleted`);
};

// Add additional helper function for recommended products
export const getFrequentlyPurchasedTogether = async (productId: string): Promise<ProductType[]> => {
  try {
    // For now, return other products in the same category
    const product = await getProductById(productId);
    
    if (!product || !product.category) {
      return [];
    }
    
    const relatedProducts = mockProducts
      .filter(p => p.category === product.category && p.id !== productId)
      .slice(0, 4)
      .map(p => ({
        ...p,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        num_reviews: p.numReviews,
      })) as unknown as ProductType[];
    
    return relatedProducts;
  } catch (error) {
    console.error("Error fetching related products:", error);
    return [];
  }
};
