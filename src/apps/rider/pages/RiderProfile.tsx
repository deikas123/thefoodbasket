
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { formatCurrency } from "@/utils/currencyFormatter";
import { User, Package, TrendingUp, Star } from "lucide-react";

const RiderProfile = () => {
  const { user } = useAuth();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["rider-profile", user?.id],
    queryFn: async () => {
      // Get profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single();

      // Get delivery stats
      const { data: orders } = await supabase
        .from("orders")
        .select("*")
        .eq("assigned_to", user?.id);

      const completedOrders = orders?.filter(o => o.status === "delivered") || [];
      const totalEarnings = completedOrders.reduce((sum, o) => sum + (o.delivery_fee || 0), 0);

      // Get this month's stats
      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);
      const monthlyOrders = completedOrders.filter(o => new Date(o.updated_at) >= thisMonth);
      const monthlyEarnings = monthlyOrders.reduce((sum, o) => sum + (o.delivery_fee || 0), 0);

      return {
        ...profileData,
        totalDeliveries: completedOrders.length,
        totalEarnings,
        monthlyDeliveries: monthlyOrders.length,
        monthlyEarnings,
      };
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-48 bg-muted rounded" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Profile</h1>

      {/* Profile Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-10 w-10 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold">
                {profile?.first_name || profile?.last_name 
                  ? `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim()
                  : "Rider"
                }
              </h2>
              <p className="text-muted-foreground">{user?.email}</p>
              <p className="text-sm text-muted-foreground">{profile?.phone || "No phone"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Package className="h-4 w-4 text-blue-500" />
              Total Deliveries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{profile?.totalDeliveries || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              Total Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatCurrency(profile?.totalEarnings || 0)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{profile?.monthlyDeliveries || 0}</p>
            <p className="text-sm text-muted-foreground">deliveries</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-500" />
              Monthly Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatCurrency(profile?.monthlyEarnings || 0)}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RiderProfile;
