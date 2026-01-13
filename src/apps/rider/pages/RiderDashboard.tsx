
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { formatCurrency } from "@/utils/currencyFormatter";
import { Package, CheckCircle, Clock, TrendingUp, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const RiderDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: stats, isLoading } = useQuery({
    queryKey: ["rider-dashboard", user?.id],
    queryFn: async () => {
      // Get assigned orders
      const { data: orders } = await supabase
        .from("orders")
        .select("*")
        .eq("assigned_to", user?.id);

      const activeOrders = orders?.filter(o => 
        ["dispatched", "out_for_delivery"].includes(o.status)
      ) || [];
      
      const completedToday = orders?.filter(o => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return o.status === "delivered" && new Date(o.updated_at) >= today;
      }) || [];

      const allCompleted = orders?.filter(o => o.status === "delivered") || [];
      const totalEarnings = allCompleted.reduce((sum, o) => sum + (o.delivery_fee || 0), 0);

      return {
        activeDeliveries: activeOrders.length,
        completedToday: completedToday.length,
        totalCompleted: allCompleted.length,
        totalEarnings,
        pendingPickup: activeOrders.filter(o => o.status === "dispatched").length,
        inTransit: activeOrders.filter(o => o.status === "out_for_delivery").length,
        recentOrders: activeOrders.slice(0, 3)
      };
    },
    enabled: !!user?.id,
    staleTime: 30000,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
      <h1 className="text-2xl font-bold">Welcome Back, Rider!</h1>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">{stats?.activeDeliveries}</div>
            <p className="text-xs text-blue-600">deliveries</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{stats?.completedToday}</div>
            <p className="text-xs text-green-600">completed</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pickup</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-700">{stats?.pendingPickup}</div>
            <p className="text-xs text-orange-600">pending</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Earnings</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700">{formatCurrency(stats?.totalEarnings || 0)}</div>
            <p className="text-xs text-purple-600">total</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <Button 
            className="h-24 flex-col gap-2"
            onClick={() => navigate("/rider-app/deliveries")}
          >
            <Package className="h-8 w-8" />
            View Deliveries
          </Button>
          <Button 
            variant="outline"
            className="h-24 flex-col gap-2"
            onClick={() => navigate("/rider-app/history")}
          >
            <CheckCircle className="h-8 w-8" />
            View History
          </Button>
        </CardContent>
      </Card>

      {/* Recent Orders */}
      {stats?.recentOrders && stats.recentOrders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Active Deliveries
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.recentOrders.map((order: any) => (
              <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-mono text-sm">#{order.id.slice(0, 8)}</p>
                  <p className="text-sm text-muted-foreground">
                    {(order.delivery_address as any)?.street || "Address not available"}
                  </p>
                </div>
                <Button size="sm" onClick={() => navigate("/rider-app/deliveries")}>
                  View
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RiderDashboard;
