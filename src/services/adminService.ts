
import { supabase } from "@/integrations/supabase/client";
import { KYCVerification } from "@/types/kyc";
import { toast } from "@/components/ui/use-toast";

// Get KYC verifications for admin review
export const getKYCVerificationsForAdmin = async (): Promise<KYCVerification[]> => {
  try {
    const { data, error } = await supabase
      .from('kyc_verifications')
      .select(`
        *,
        profile:user_id (
          first_name,
          last_name,
          phone
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching KYC verifications:", error);
      throw error;
    }

    return (data || []).map(item => ({
      id: item.id,
      userId: item.user_id,
      idDocumentUrl: item.id_document_url || undefined,
      addressProofUrl: item.address_proof_url || undefined,
      status: item.status as "pending" | "approved" | "rejected",
      adminNotes: item.admin_notes || undefined,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      userDetails: item.profile ? {
        firstName: item.profile.first_name,
        lastName: item.profile.last_name,
        phone: item.profile.phone
      } : undefined
    }));
  } catch (error) {
    console.error("Error in getKYCVerificationsForAdmin:", error);
    return [];
  }
};

// Update KYC verification status
export const updateKYCVerification = async (
  id: string,
  updateData: {
    status: "approved" | "rejected";
    adminNotes?: string;
  }
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('kyc_verifications')
      .update({
        status: updateData.status,
        admin_notes: updateData.adminNotes,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error("Error updating KYC verification:", error);
      toast({
        title: "Error",
        description: "Failed to update verification status: " + error.message,
        variant: "destructive",
      });
      return false;
    }

    toast({
      title: "Success",
      description: `Verification ${updateData.status} successfully!`,
    });

    return true;
  } catch (error) {
    console.error("Error in updateKYCVerification:", error);
    return false;
  }
};

// Get statistics for admin dashboard
export interface AdminStats {
  revenueToday: number;
  revenueThisMonth: number;
  revenueLastMonth: number;
  ordersToday: number;
  ordersThisMonth: number;
  pendingOrders: number;
  newCustomers: number;
  activeCustomers: number;
  topSellingProducts: {
    id: string;
    name: string;
    quantity: number;
    revenue: number;
  }[];
  categorySales: {
    name: string;
    value: number;
  }[];
  monthlyRevenue: {
    month: string;
    value: number;
  }[];
  orderStatuses: {
    status: string;
    count: number;
  }[];
}

export const getAdminDashboardStats = async (): Promise<AdminStats> => {
  try {
    console.log("Fetching admin dashboard stats...");
    
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Get orders data with better error handling
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*');

    if (ordersError) {
      console.error('Error fetching orders:', ordersError);
      // Continue with empty array instead of throwing
    }

    console.log("Orders fetched:", orders?.length || 0);

    // Get products with categories
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select(`
        id,
        name,
        price,
        category_id,
        categories!inner(name)
      `);

    if (productsError) {
      console.error('Error fetching products:', productsError);
    }

    console.log("Products fetched:", products?.length || 0);

    // Get profiles count
    const { count: profilesCount, error: profilesError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (profilesError) {
      console.error('Error fetching profiles count:', profilesError);
    }

    console.log("Profiles count:", profilesCount || 0);

    // Safe array operations with fallbacks
    const safeOrders = orders || [];
    const safeProducts = products || [];

    // Calculate date-based stats
    const todaysOrders = safeOrders.filter(order => {
      const orderDate = new Date(order.created_at);
      return orderDate >= startOfToday;
    });

    const thisMonthOrders = safeOrders.filter(order => {
      const orderDate = new Date(order.created_at);
      return orderDate >= startOfMonth;
    });

    const lastMonthOrders = safeOrders.filter(order => {
      const orderDate = new Date(order.created_at);
      return orderDate >= startOfLastMonth && orderDate <= endOfLastMonth;
    });

    const pendingOrders = safeOrders.filter(order => order.status === 'pending');

    // Calculate revenue with proper number handling
    const revenueToday = todaysOrders.reduce((sum, order) => {
      const total = parseFloat(order.total) || 0;
      return sum + total;
    }, 0);

    const revenueThisMonth = thisMonthOrders.reduce((sum, order) => {
      const total = parseFloat(order.total) || 0;
      return sum + total;
    }, 0);

    const revenueLastMonth = lastMonthOrders.reduce((sum, order) => {
      const total = parseFloat(order.total) || 0;
      return sum + total;
    }, 0);

    console.log("Revenue calculated:", { revenueToday, revenueThisMonth, revenueLastMonth });

    // Calculate category sales from products
    const categorySales: { [key: string]: number } = {};
    safeProducts.forEach(product => {
      const categoryName = product.categories?.name || 'Other';
      categorySales[categoryName] = (categorySales[categoryName] || 0) + 1;
    });

    const totalProducts = Object.values(categorySales).reduce((sum, count) => sum + count, 0);
    const categorySalesArray = Object.entries(categorySales).map(([name, count]) => ({
      name,
      value: totalProducts > 0 ? Math.round((count / totalProducts) * 100) : 0
    }));

    // Calculate monthly revenue for last 6 months
    const monthlyRevenue = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      const monthOrders = safeOrders.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate >= monthStart && orderDate <= monthEnd;
      });

      const monthRevenue = monthOrders.reduce((sum, order) => {
        const total = parseFloat(order.total) || 0;
        return sum + total;
      }, 0);
      
      monthlyRevenue.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short' }),
        value: monthRevenue
      });
    }

    // Calculate order statuses
    const statusCounts: { [key: string]: number } = {};
    safeOrders.forEach(order => {
      const status = order.status || 'unknown';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    const orderStatuses = Object.entries(statusCounts).map(([status, count]) => ({
      status: status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' '),
      count
    }));

    // Calculate top selling products from order items
    const productSales: { [key: string]: { name: string; quantity: number; revenue: number } } = {};
    
    safeOrders.forEach(order => {
      try {
        const items = Array.isArray(order.items) ? order.items : [];
        items.forEach((item: any) => {
          const productId = item.productId || item.id;
          const name = item.name || 'Unknown Product';
          const quantity = parseInt(item.quantity) || 0;
          const price = parseFloat(item.price) || 0;
          
          if (!productSales[productId]) {
            productSales[productId] = { name, quantity: 0, revenue: 0 };
          }
          productSales[productId].quantity += quantity;
          productSales[productId].revenue += price * quantity;
        });
      } catch (error) {
        console.error("Error processing order items:", error);
      }
    });

    const topSellingProducts = Object.entries(productSales)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 3);

    const stats = {
      revenueToday: Math.round(revenueToday),
      revenueThisMonth: Math.round(revenueThisMonth),
      revenueLastMonth: Math.round(revenueLastMonth),
      ordersToday: todaysOrders.length,
      ordersThisMonth: thisMonthOrders.length,
      pendingOrders: pendingOrders.length,
      newCustomers: Math.max(0, (profilesCount || 0) - 100),
      activeCustomers: profilesCount || 0,
      topSellingProducts,
      categorySales: categorySalesArray,
      monthlyRevenue,
      orderStatuses
    };

    console.log("Final stats:", stats);
    return stats;

  } catch (error) {
    console.error("Error fetching admin dashboard stats:", error);
    // Return empty stats instead of dummy data
    return {
      revenueToday: 0,
      revenueThisMonth: 0,
      revenueLastMonth: 0,
      ordersToday: 0,
      ordersThisMonth: 0,
      pendingOrders: 0,
      newCustomers: 0,
      activeCustomers: 0,
      topSellingProducts: [],
      categorySales: [],
      monthlyRevenue: [],
      orderStatuses: []
    };
  }
};
