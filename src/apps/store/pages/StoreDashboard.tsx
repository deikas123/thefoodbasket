
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/utils/currencyFormatter";
import { Package, ShoppingCart, DollarSign, TrendingUp, AlertTriangle } from "lucide-react";

interface StoreDashboardProps {
  storeId: string | null;
}

const StoreDashboard: React.FC<StoreDashboardProps> = ({ storeId }) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["store-dashboard", storeId],
    queryFn: async () => {
      // Get products count
      let productsQuery = supabase.from("products").select("*", { count: "exact", head: false });
      if (storeId) productsQuery = productsQuery.eq("store_id", storeId);
      const { data: products, count: productsCount } = await productsQuery;

      // Get low stock products
      let lowStockQuery = supabase.from("products").select("*").lt("stock", 10);
      if (storeId) lowStockQuery = lowStockQuery.eq("store_id", storeId);
      const { data: lowStock } = await lowStockQuery;

      // Get today's orders
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      let ordersQuery = supabase
        .from("orders")
        .select("*")
        .gte("created_at", today.toISOString());
      if (storeId) ordersQuery = ordersQuery.eq("store_id", storeId);
      const { data: todayOrders } = await ordersQuery;

      // Get pending orders
      let pendingQuery = supabase
        .from("orders")
        .select("*")
        .in("status", ["pending", "processing"]);
      if (storeId) pendingQuery = pendingQuery.eq("store_id", storeId);
      const { data: pendingOrders } = await pendingQuery;

      const todayRevenue = todayOrders?.reduce((sum, o) => sum + (o.total || 0), 0) || 0;

      return {
        totalProducts: productsCount || 0,
        lowStockCount: lowStock?.length || 0,
        todayOrders: todayOrders?.length || 0,
        pendingOrders: pendingOrders?.length || 0,
        todayRevenue,
        lowStockProducts: lowStock?.slice(0, 5) || []
      };
    },
    staleTime: 60000,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
      <h1 className="text-2xl font-bold">Store Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalProducts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{stats?.lowStockCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Today's Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.todayOrders}</div>
            <p className="text-xs text-muted-foreground">{stats?.pendingOrders} pending</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(stats?.todayRevenue || 0)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {stats?.lowStockProducts && stats.lowStockProducts.length > 0 && (
        <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
              <AlertTriangle className="h-5 w-5" />
              Low Stock Alert
            </CardTitle>
            <CardDescription>These products need restocking</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.lowStockProducts.map((product: any) => (
                <div key={product.id} className="flex justify-between items-center bg-background rounded-lg p-3">
                  <span className="font-medium">{product.name}</span>
                  <span className="text-red-500 font-bold">{product.stock} left</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StoreDashboard;
