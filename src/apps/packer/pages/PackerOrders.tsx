
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { startPacking, completePacking } from "@/services/orderFlowService";
import { Package, CheckCircle, Truck, Clock, AlertCircle } from "lucide-react";
import { formatCurrency } from "@/utils/currencyFormatter";

const PackerOrders = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const { data: orders, isLoading } = useQuery({
    queryKey: ["packer-orders"],
    queryFn: async () => {
      const { data } = await supabase
        .from("orders")
        .select("*")
        .in("status", ["pending", "processing"])
        .order("created_at", { ascending: true });
      return data;
    },
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const startPackingMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const result = await startPacking(orderId, user?.id || "");
      if (!result.success) throw new Error(result.message);
      return result;
    },
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ["packer-orders"] }); 
      toast.success("Started packing order"); 
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  const completePackingMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const result = await completePacking(orderId, user?.id || "");
      if (!result.success) throw new Error(result.message);
      return result;
    },
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ["packer-orders"] }); 
      toast.success("Order packed and ready for pickup! Inventory updated."); 
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "processing": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      default: return "bg-muted text-muted-foreground";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6 h-32" />
          </Card>
        ))}
      </div>
    );
  }

  const pendingOrders = orders?.filter(o => o.status === "pending") || [];
  const processingOrders = orders?.filter(o => o.status === "processing") || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Order Queue</h1>
        <div className="flex gap-2">
          <Badge variant="outline" className="gap-1">
            <Clock className="h-3 w-3" />
            Pending: {pendingOrders.length}
          </Badge>
          <Badge variant="outline" className="gap-1 bg-blue-50 dark:bg-blue-950">
            <Package className="h-3 w-3" />
            Packing: {processingOrders.length}
          </Badge>
        </div>
      </div>

      {!orders?.length ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium">No orders to pack</p>
            <p className="text-sm">New orders will appear here</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const items = order.items as any[];
            const isProcessing = order.status === "processing";
            
            return (
              <Card key={order.id} className={`transition-all ${isProcessing ? "ring-2 ring-blue-500" : ""}`}>
                <div className={`h-1 ${isProcessing ? "bg-blue-500" : "bg-yellow-500"}`} />
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <CardTitle className="font-mono text-lg">#{order.id.slice(0,8)}</CardTitle>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status === "pending" ? "Waiting" : "Packing"}
                      </Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(order.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Items checklist */}
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Items to Pack ({items?.length || 0})
                    </p>
                    <div className="space-y-1">
                      {items?.map((item: any, i: number) => (
                        <div key={i} className="flex justify-between text-sm py-1.5 border-b last:border-0 border-border/50">
                          <span className="flex items-center gap-2">
                            {isProcessing && <CheckCircle className="h-4 w-4 text-green-500" />}
                            {item.name}
                          </span>
                          <span className="font-medium bg-background px-2 py-0.5 rounded">
                            x{item.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order total */}
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Order Total</span>
                    <span className="font-bold">{formatCurrency(order.total)}</span>
                  </div>

                  {/* Notes */}
                  {order.notes && (
                    <div className="flex items-start gap-2 p-2 bg-yellow-50 dark:bg-yellow-950/20 rounded text-sm">
                      <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                      <span>{order.notes}</span>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex gap-2 pt-2">
                    {order.status === "pending" && (
                      <Button 
                        className="flex-1"
                        onClick={() => startPackingMutation.mutate(order.id)}
                        disabled={startPackingMutation.isPending}
                      >
                        <Package className="h-4 w-4 mr-2" />
                        {startPackingMutation.isPending ? "Starting..." : "Start Packing"}
                      </Button>
                    )}
                    {order.status === "processing" && (
                      <Button 
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() => completePackingMutation.mutate(order.id)}
                        disabled={completePackingMutation.isPending}
                      >
                        <Truck className="h-4 w-4 mr-2" />
                        {completePackingMutation.isPending ? "Completing..." : "Ready for Pickup"}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PackerOrders;
