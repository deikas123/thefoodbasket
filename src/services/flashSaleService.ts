import { supabase } from "@/integrations/supabase/client";
import { ProductType } from "@/types/supabase";

export interface FlashSale {
  id: string;
  name: string;
  description: string | null;
  discount_percentage: number;
  start_date: string;
  end_date: string;
  active: boolean;
  banner_color: string | null;
  created_at: string;
  updated_at: string;
}

export interface FlashSaleProduct {
  id: string;
  flash_sale_id: string;
  product_id: string;
  sale_price: number | null;
  stock_limit: number | null;
  sold_count: number | null;
  created_at: string;
  product?: ProductType;
}

export interface FlashSaleWithProducts extends FlashSale {
  products: FlashSaleProduct[];
}

export interface FlashSaleFormData {
  name: string;
  description?: string;
  discount_percentage: number;
  start_date: string;
  end_date: string;
  active: boolean;
  banner_color?: string;
}

export interface FlashSaleProductFormData {
  flash_sale_id: string;
  product_id: string;
  sale_price?: number;
  stock_limit?: number;
}

// Fetch all flash sales (admin)
export const getFlashSales = async (): Promise<FlashSale[]> => {
  const { data, error } = await supabase
    .from("flash_sales")
    .select("*")
    .order("start_date", { ascending: false });

  if (error) throw error;
  return data || [];
};

// Fetch active flash sales with products (public)
export const getActiveFlashSales = async (): Promise<FlashSaleWithProducts[]> => {
  const now = new Date().toISOString();
  
  const { data: flashSales, error: salesError } = await supabase
    .from("flash_sales")
    .select("*")
    .eq("active", true)
    .lte("start_date", now)
    .gte("end_date", now)
    .order("start_date", { ascending: true });

  if (salesError) throw salesError;
  if (!flashSales || flashSales.length === 0) return [];

  // Fetch products for each flash sale
  const result: FlashSaleWithProducts[] = [];
  
  for (const sale of flashSales) {
    const { data: saleProducts, error: productsError } = await supabase
      .from("flash_sale_products")
      .select("*")
      .eq("flash_sale_id", sale.id);

    if (productsError) throw productsError;

    // Fetch product details
    const productIds = (saleProducts || []).map(sp => sp.product_id);
    
    if (productIds.length > 0) {
      const { data: products, error: productError } = await supabase
        .from("products")
        .select("*")
        .in("id", productIds);

      if (productError) throw productError;

      const productsWithDetails = (saleProducts || []).map(sp => ({
        ...sp,
        product: products?.find(p => p.id === sp.product_id) as ProductType | undefined
      }));

      result.push({
        ...sale,
        products: productsWithDetails
      });
    } else {
      result.push({
        ...sale,
        products: []
      });
    }
  }

  return result;
};

// Fetch flash sale by ID with products
export const getFlashSaleById = async (id: string): Promise<FlashSaleWithProducts | null> => {
  const { data: flashSale, error: saleError } = await supabase
    .from("flash_sales")
    .select("*")
    .eq("id", id)
    .single();

  if (saleError) throw saleError;
  if (!flashSale) return null;

  const { data: saleProducts, error: productsError } = await supabase
    .from("flash_sale_products")
    .select("*")
    .eq("flash_sale_id", id);

  if (productsError) throw productsError;

  // Fetch product details
  const productIds = (saleProducts || []).map(sp => sp.product_id);
  
  if (productIds.length > 0) {
    const { data: products, error: productError } = await supabase
      .from("products")
      .select("*")
      .in("id", productIds);

    if (productError) throw productError;

    const productsWithDetails = (saleProducts || []).map(sp => ({
      ...sp,
      product: products?.find(p => p.id === sp.product_id) as ProductType | undefined
    }));

    return {
      ...flashSale,
      products: productsWithDetails
    };
  }

  return {
    ...flashSale,
    products: []
  };
};

// Create a new flash sale
export const createFlashSale = async (data: FlashSaleFormData): Promise<FlashSale> => {
  const { data: flashSale, error } = await supabase
    .from("flash_sales")
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return flashSale;
};

// Update a flash sale
export const updateFlashSale = async (id: string, data: Partial<FlashSaleFormData>): Promise<FlashSale> => {
  const { data: flashSale, error } = await supabase
    .from("flash_sales")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return flashSale;
};

// Delete a flash sale
export const deleteFlashSale = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from("flash_sales")
    .delete()
    .eq("id", id);

  if (error) throw error;
};

// Add product to flash sale
export const addFlashSaleProduct = async (data: FlashSaleProductFormData): Promise<FlashSaleProduct> => {
  const { data: product, error } = await supabase
    .from("flash_sale_products")
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return product;
};

// Remove product from flash sale
export const removeFlashSaleProduct = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from("flash_sale_products")
    .delete()
    .eq("id", id);

  if (error) throw error;
};

// Update flash sale product
export const updateFlashSaleProduct = async (
  id: string, 
  data: Partial<FlashSaleProductFormData>
): Promise<FlashSaleProduct> => {
  const { data: product, error } = await supabase
    .from("flash_sale_products")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return product;
};
