
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/utils/currencyFormatter";
import { BarChart, LineChart, PieChart } from "@/components/ui/chart";
import { TrendingUp, ShoppingCart, Package, DollarSign } from "lucide-react";

interface StoreAnalyticsProps {
  storeId: string | null;
}

const StoreAnalytics: React.FC<StoreAnalyticsProps> = ({ storeId }) => {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["store-analytics", storeId],
    queryFn: async () => {
      // Get orders for the store
      let ordersQuery = supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (storeId) ordersQuery = ordersQuery.eq("store_id", storeId);
      const { data: orders } = await ordersQuery;

      // Get products with categories
      let productsQuery = supabase
        .from("products")
        .select("*, category:categories(name)");
      if (storeId) productsQuery = productsQuery.eq("store_id", storeId);
      const { data: products } = await productsQuery;

      // Calculate monthly revenue
      const now = new Date();
      const monthlyRevenue = [];
      for (let i = 5; i >= 0; i--) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        const monthOrders = orders?.filter(o => {
          const date = new Date(o.created_at);
          return date >= monthStart && date <= monthEnd;
        }) || [];
        const revenue = monthOrders.reduce((sum, o) => sum + (o.total || 0), 0);
        monthlyRevenue.push({
          month: monthStart.toLocaleString("default", { month: "short" }),
          value: revenue
        });
      }

      // Calculate category distribution
      const categoryCount: Record<string, number> = {};
      products?.forEach(p => {
        const catName = (p.category as any)?.name || "Unknown";
        categoryCount[catName] = (categoryCount[catName] || 0) + 1;
      });
      const categorySales = Object.entries(categoryCount).map(([name, value]) => ({
        name,
        value
      }));

      // Calculate order statuses
      const statusCount: Record<string, number> = {};
      orders?.forEach(o => {
        statusCount[o.status] = (statusCount[o.status] || 0) + 1;
      });
      const orderStatuses = Object.entries(statusCount).map(([status, count]) => ({
        name: status,
        value: count
      }));

      const totalRevenue = orders?.reduce((sum, o) => sum + (o.total || 0), 0) || 0;
      const totalOrders = orders?.length || 0;
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      return {
        totalRevenue,
        totalOrders,
        avgOrderValue,
        totalProducts: products?.length || 0,
        monthlyRevenue,
        categorySales,
        orderStatuses
      };
    },
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Store Analytics</h1>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics?.totalRevenue || 0)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics?.avgOrderValue || 0)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalProducts}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Over Time</CardTitle>
            <CardDescription>Monthly revenue for the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics?.monthlyRevenue && analytics.monthlyRevenue.length > 0 ? (
              <LineChart
                data={analytics.monthlyRevenue}
                xAxisKey="month"
                yAxisKey="value"
                height={300}
              />
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No revenue data yet
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Products by Category</CardTitle>
            <CardDescription>Distribution of products across categories</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics?.categorySales && analytics.categorySales.length > 0 ? (
              <PieChart
                data={analytics.categorySales}
                nameKey="name"
                dataKey="value"
                height={300}
              />
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No category data yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Orders by Status</CardTitle>
          <CardDescription>Current distribution of order statuses</CardDescription>
        </CardHeader>
        <CardContent>
          {analytics?.orderStatuses && analytics.orderStatuses.length > 0 ? (
            <BarChart
              data={analytics.orderStatuses}
              xAxisKey="name"
              yAxisKey="value"
              height={250}
            />
          ) : (
            <div className="h-[250px] flex items-center justify-center text-muted-foreground">
              No order data yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StoreAnalytics;
