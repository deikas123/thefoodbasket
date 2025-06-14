
import { AdminStats } from "./dashboardTypes";
import { fetchOrdersData, fetchProductsData, fetchProfilesCount } from "./dataFetchers";
import { 
  calculateDateBasedStats, 
  calculateRevenue, 
  calculateCategorySales,
  calculateMonthlyRevenue,
  calculateOrderStatuses,
  calculateTopSellingProducts
} from "./statsCalculators";

export const getAdminDashboardStats = async (): Promise<AdminStats> => {
  try {
    console.log("Fetching admin dashboard stats...");
    
    // Fetch all required data
    const orders = await fetchOrdersData();
    const products = await fetchProductsData();
    const profilesCount = await fetchProfilesCount();

    // Calculate date-based stats
    const { todaysOrders, thisMonthOrders, lastMonthOrders, pendingOrders } = calculateDateBasedStats(orders);

    // Calculate revenue
    const revenue = calculateRevenue(todaysOrders, thisMonthOrders, lastMonthOrders);

    // Calculate other stats
    const categorySales = calculateCategorySales(products);
    const monthlyRevenue = calculateMonthlyRevenue(orders);
    const orderStatuses = calculateOrderStatuses(orders);
    const topSellingProducts = calculateTopSellingProducts(orders);

    const stats: AdminStats = {
      ...revenue,
      ordersToday: todaysOrders.length,
      ordersThisMonth: thisMonthOrders.length,
      pendingOrders: pendingOrders.length,
      newCustomers: Math.max(0, profilesCount - 100),
      activeCustomers: profilesCount,
      topSellingProducts,
      categorySales,
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
