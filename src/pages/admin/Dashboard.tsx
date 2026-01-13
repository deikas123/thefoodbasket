
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, LineChart, PieChart } from "@/components/ui/chart";
import { 
  ShoppingBag, 
  Users, 
  Package, 
  Truck, 
  ArrowUpRight, 
  DollarSign
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getAdminDashboardStats } from "@/services/admin";
import AdminProductsTable from "@/components/admin/ProductsTable";
import AdminOrdersTable from "@/components/admin/OrdersTable";
import AdminUsersTable from "@/components/admin/UsersTable";
import AdminDeliveriesTable from "@/components/admin/DeliveriesTable";
import FlashSaleAnalyticsWidget from "@/components/admin/flashSales/FlashSaleAnalyticsWidget";
import { formatCurrency } from "@/utils/currencyFormatter";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  
  const { data: stats, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: getAdminDashboardStats,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: true,
  });

  // Debug logging
  useEffect(() => {
    console.log("Dashboard data:", { stats, isLoading, error });
  }, [stats, isLoading, error]);
  
  if (isLoading || !stats) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="h-12 pb-2" />
              <CardContent>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-2" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="animate-pulse h-64" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Error Loading Dashboard</CardTitle>
            <CardDescription>
              There was an error loading the dashboard data: {error.message}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <button 
              onClick={() => refetch()} 
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Retry
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.revenueThisMonth)}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              {stats.revenueLastMonth > 0 ? (
                stats.revenueThisMonth > stats.revenueLastMonth ? (
                  <span className="text-green-500 flex items-center">
                    +{Math.round(((stats.revenueThisMonth - stats.revenueLastMonth) / stats.revenueLastMonth) * 100)}% <ArrowUpRight className="h-3 w-3" />
                  </span>
                ) : stats.revenueThisMonth < stats.revenueLastMonth ? (
                  <span className="text-red-500 flex items-center">
                    -{Math.round(((stats.revenueLastMonth - stats.revenueThisMonth) / stats.revenueLastMonth) * 100)}% <ArrowUpRight className="h-3 w-3 rotate-90" />
                  </span>
                ) : (
                  <span className="text-gray-500">0%</span>
                )
              ) : (
                <span className="text-blue-500">New data</span>
              )}
              from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">New Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.newCustomers}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="text-green-500 flex items-center">
                {stats.activeCustomers > 0 ? Math.round((stats.newCustomers / stats.activeCustomers) * 100) : 0}% <ArrowUpRight className="h-3 w-3" />
              </span>
              of active users
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingOrders}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="text-blue-500 flex items-center">
                {stats.ordersThisMonth > 0 ? Math.round((stats.pendingOrders / stats.ordersThisMonth) * 100) : 0}% <ArrowUpRight className="h-3 w-3 rotate-45" />
              </span>
              of this month's orders
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Today's Orders</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.ordersToday}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="text-green-500 flex items-center">
                {stats.ordersThisMonth > 0 ? Math.round((stats.ordersToday / stats.ordersThisMonth) * 100) : 0}% <ArrowUpRight className="h-3 w-3" />
              </span>
              of monthly orders
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-5 w-full max-w-2xl mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="deliveries">Deliveries</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Over Time</CardTitle>
                <CardDescription>
                  Monthly revenue for the last 6 months
                </CardDescription>
              </CardHeader>
              <CardContent>
                {stats.monthlyRevenue && stats.monthlyRevenue.length > 0 ? (
                  <LineChart 
                    data={stats.monthlyRevenue}
                    xAxisKey="month"
                    yAxisKey="value"
                    height={300}
                  />
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    No revenue data available yet
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Top Selling Categories</CardTitle>
                <CardDescription>
                  Percentage of products by category
                </CardDescription>
              </CardHeader>
              <CardContent>
                {stats.categorySales && stats.categorySales.length > 0 ? (
                  <PieChart 
                    data={stats.categorySales}
                    nameKey="name"
                    dataKey="value"
                    height={300}
                  />
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    No category data available yet
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Orders by Status</CardTitle>
              <CardDescription>
                Current distribution of order statuses
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats.orderStatuses && stats.orderStatuses.length > 0 ? (
                <BarChart 
                  data={stats.orderStatuses.map(item => ({
                    name: item.status,
                    value: item.count
                  }))}
                  xAxisKey="name"
                  yAxisKey="value"
                  height={300}
                />
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  No order data available yet
                </div>
              )}
            </CardContent>
          </Card>

          {stats.topSellingProducts && stats.topSellingProducts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Top Selling Products</CardTitle>
                <CardDescription>
                  Best performing products by quantity sold
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.topSellingProducts.map((product, index) => (
                    <div key={product.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-muted-foreground">
                          #{index + 1}
                        </span>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {product.quantity} units sold
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(product.revenue)}</p>
                        <p className="text-sm text-muted-foreground">Revenue</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Flash Sale Analytics Widget */}
          <FlashSaleAnalyticsWidget />
        </TabsContent>
        
        <TabsContent value="products">
          <AdminProductsTable />
        </TabsContent>
        
        <TabsContent value="orders">
          <AdminOrdersTable />
        </TabsContent>
        
        <TabsContent value="users">
          <AdminUsersTable />
        </TabsContent>
        
        <TabsContent value="deliveries">
          <AdminDeliveriesTable />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
