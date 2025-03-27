
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, LineChart, PieChart } from "@/components/ui/chart";
import { 
  ShoppingBag, 
  Users, 
  Package, 
  Truck, 
  ArrowUpRight, 
  DollarSign,
  ShoppingCart
} from "lucide-react";
import AdminProductsTable from "@/components/admin/ProductsTable";
import AdminOrdersTable from "@/components/admin/OrdersTable";
import AdminUsersTable from "@/components/admin/UsersTable";
import AdminDeliveriesTable from "@/components/admin/DeliveriesTable";

const AdminDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Redirect if not logged in or not an admin
  if (!isAuthenticated) {
    navigate("/login", { state: { from: "/admin" } });
    return null;
  }
  
  if (user?.role !== "admin") {
    navigate("/");
    return null;
  }
  
  // Dashboard metrics - these would come from an API in a real app
  const metrics = {
    totalRevenue: "KSh 243,500",
    salesGrowth: "+12.5%",
    newCustomers: 56,
    customerGrowth: "+8.2%",
    pendingOrders: 24,
    orderGrowth: "+18.3%",
    deliveredOrders: 187,
    deliveryGrowth: "+5.7%"
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => navigate("/")}>
                View Store
              </Button>
            </div>
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
              {/* Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metrics.totalRevenue}</div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <span className="text-green-500 flex items-center">
                        {metrics.salesGrowth} <ArrowUpRight className="h-3 w-3" />
                      </span>
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
                    <div className="text-2xl font-bold">{metrics.newCustomers}</div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <span className="text-green-500 flex items-center">
                        {metrics.customerGrowth} <ArrowUpRight className="h-3 w-3" />
                      </span>
                      from last month
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
                    <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metrics.pendingOrders}</div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <span className="text-green-500 flex items-center">
                        {metrics.orderGrowth} <ArrowUpRight className="h-3 w-3" />
                      </span>
                      from last month
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Delivered Orders</CardTitle>
                    <Truck className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metrics.deliveredOrders}</div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <span className="text-green-500 flex items-center">
                        {metrics.deliveryGrowth} <ArrowUpRight className="h-3 w-3" />
                      </span>
                      from last month
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Over Time</CardTitle>
                    <CardDescription>
                      Monthly revenue in KSh for the last 6 months
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <LineChart 
                      data={[
                        { name: 'Jan', value: 125000 },
                        { name: 'Feb', value: 140000 },
                        { name: 'Mar', value: 135000 },
                        { name: 'Apr', value: 160000 },
                        { name: 'May', value: 190000 },
                        { name: 'Jun', value: 243500 },
                      ]}
                      xAxisKey="name"
                      yAxisKey="value"
                      height={300}
                    />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Top Selling Categories</CardTitle>
                    <CardDescription>
                      Percentage of sales by category
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <PieChart 
                      data={[
                        { name: 'Fruits', value: 35 },
                        { name: 'Vegetables', value: 30 },
                        { name: 'Dairy', value: 15 },
                        { name: 'Meat', value: 12 },
                        { name: 'Bakery', value: 8 },
                      ]}
                      nameKey="name"
                      dataKey="value"
                      height={300}
                    />
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
                  <BarChart 
                    data={[
                      { name: 'Pending', value: 24 },
                      { name: 'Processing', value: 18 },
                      { name: 'Dispatched', value: 12 },
                      { name: 'Out for Delivery', value: 16 },
                      { name: 'Delivered', value: 187 },
                      { name: 'Cancelled', value: 8 },
                    ]}
                    xAxisKey="name"
                    yAxisKey="value"
                    height={300}
                  />
                </CardContent>
              </Card>
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
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
