
import { supabase } from "@/integrations/supabase/client";

export interface FlashSaleAnalytics {
  totalSales: number;
  totalRevenue: number;
  totalProductsSold: number;
  activeFlashSales: number;
  topProducts: {
    id: string;
    name: string;
    quantitySold: number;
    revenue: number;
  }[];
  salesByFlashSale: {
    id: string;
    name: string;
    productsSold: number;
    revenue: number;
  }[];
}

export async function getFlashSaleAnalytics(): Promise<FlashSaleAnalytics> {
  try {
    // Get all flash sales
    const { data: flashSales } = await supabase
      .from("flash_sales")
      .select("*");

    // Get flash sale products with sold counts
    const { data: flashSaleProducts } = await supabase
      .from("flash_sale_products")
      .select(`
        *,
        product:products(id, name, price)
      `);

    // Get orders that might contain flash sale products
    const { data: orders } = await supabase
      .from("orders")
      .select("*")
      .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    // Calculate analytics
    const now = new Date();
    const activeFlashSales = flashSales?.filter(fs => {
      const start = new Date(fs.start_date);
      const end = new Date(fs.end_date);
      return fs.active && start <= now && end >= now;
    }).length || 0;

    // Calculate total products sold from flash_sale_products sold_count
    const totalProductsSold = flashSaleProducts?.reduce((sum, fsp) => sum + (fsp.sold_count || 0), 0) || 0;

    // Calculate revenue from flash sale products
    const totalRevenue = flashSaleProducts?.reduce((sum, fsp) => {
      const salePrice = fsp.sale_price || (fsp.product as any)?.price || 0;
      return sum + (salePrice * (fsp.sold_count || 0));
    }, 0) || 0;

    // Get top products
    const topProducts = flashSaleProducts
      ?.filter(fsp => (fsp.sold_count || 0) > 0)
      .sort((a, b) => (b.sold_count || 0) - (a.sold_count || 0))
      .slice(0, 5)
      .map(fsp => ({
        id: fsp.product_id,
        name: (fsp.product as any)?.name || "Unknown",
        quantitySold: fsp.sold_count || 0,
        revenue: (fsp.sale_price || (fsp.product as any)?.price || 0) * (fsp.sold_count || 0)
      })) || [];

    // Calculate sales by flash sale
    const salesByFlashSale = flashSales?.map(fs => {
      const products = flashSaleProducts?.filter(fsp => fsp.flash_sale_id === fs.id) || [];
      const productsSold = products.reduce((sum, p) => sum + (p.sold_count || 0), 0);
      const revenue = products.reduce((sum, p) => {
        const price = p.sale_price || (p.product as any)?.price || 0;
        return sum + (price * (p.sold_count || 0));
      }, 0);
      return {
        id: fs.id,
        name: fs.name,
        productsSold,
        revenue
      };
    }).filter(fs => fs.productsSold > 0) || [];

    return {
      totalSales: orders?.length || 0,
      totalRevenue,
      totalProductsSold,
      activeFlashSales,
      topProducts,
      salesByFlashSale
    };
  } catch (error) {
    console.error("Error fetching flash sale analytics:", error);
    return {
      totalSales: 0,
      totalRevenue: 0,
      totalProductsSold: 0,
      activeFlashSales: 0,
      topProducts: [],
      salesByFlashSale: []
    };
  }
}
