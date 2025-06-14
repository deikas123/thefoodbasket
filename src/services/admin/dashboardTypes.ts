
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
