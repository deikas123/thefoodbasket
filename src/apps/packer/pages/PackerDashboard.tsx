
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Package, Clock, CheckCircle, Wifi } from "lucide-react";
import { useOrderRealtime } from "@/hooks/useOrderRealtime";

const PackerDashboard = () => {
  // Subscribe to real-time order updates
  useOrderRealtime({
    queryKeys: [["packer-dashboard"], ["packer-orders"]],
    statuses: ["pending", "processing"],
    showToasts: true,
    toastMessages: {
      insert: "New order received!",
    }
  });

  const { data: stats } = useQuery({
    queryKey: ["packer-dashboard"],
    queryFn: async () => {
      const { data: orders } = await supabase.from("orders").select("*").in("status", ["pending", "processing"]);
      const pending = orders?.filter(o => o.status === "pending").length || 0;
      const processing = orders?.filter(o => o.status === "processing").length || 0;
      return { pending, processing, total: orders?.length || 0 };
    },
    staleTime: 15000,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Packer Dashboard</h1>
        <Badge variant="outline" className="gap-1 text-green-600 border-green-300">
          <Wifi className="h-3 w-3 animate-pulse" />
          Live Updates
        </Badge>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Clock className="h-4 w-4 text-yellow-600" />Pending</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-yellow-700">{stats?.pending || 0}</p></CardContent>
        </Card>
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Package className="h-4 w-4 text-blue-600" />Packing</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-blue-700">{stats?.processing || 0}</p></CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-600" />Total Queue</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-green-700">{stats?.total || 0}</p></CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PackerDashboard;
