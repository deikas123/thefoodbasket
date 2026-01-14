
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { startPacking, completePacking } from "@/services/orderFlowService";
import { formatCurrency } from "@/utils/currencyFormatter";
import { format } from "date-fns";
import { ShoppingCart, Clock, CheckCircle, Package, Truck, AlertCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface StoreOrdersProps {
  storeId: string | null;
}

const StoreOrders: React.FC<StoreOrdersProps> = ({ storeId }) => {
  const [activeTab, setActiveTab] = useState("pending");
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ["store-orders", storeId, activeTab],
    queryFn: async () => {
      let query = supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: activeTab === "pending" });

      if (storeId) query = query.eq("store_id", storeId);
      
      if (activeTab === "pending") {
        query = query.in("status", ["pending", "processing"]);
      } else if (activeTab === "ready") {
        query = query.in("status", ["dispatched", "out_for_delivery"]);
      } else {
        query = query.eq("status", "delivered");
      }

      const { data, error } = await query.limit(50);
      if (error) throw error;
      return data;
    },
    refetchInterval: 15000, // Refresh every 15 seconds
  });

  const startPackingMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const result = await startPacking(orderId, "store");
      if (!result.success) throw new Error(result.message);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store-orders"] });
      toast.success("Order packing started");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  const completePackingMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const result = await completePacking(orderId, "store");
      if (!result.success) throw new Error(result.message);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store-orders"] });
      toast.success("Order ready for delivery! Inventory updated.");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      processing: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      dispatched: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
      out_for_delivery: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
      delivered: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    };
    const labels: Record<string, string> = {
      pending: "Pending",
      processing: "Packing",
      dispatched: "Ready",
      out_for_delivery: "Delivering",
      delivered: "Delivered"
    };
    return <Badge className={variants[status] || "bg-muted"}>{labels[status] || status}</Badge>;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="h-4 w-4" />;
      case "processing": return <Package className="h-4 w-4" />;
      case "dispatched": return <CheckCircle className="h-4 w-4" />;
      case "out_for_delivery": return <Truck className="h-4 w-4" />;
      case "delivered": return <CheckCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Order Management</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" /> 
            <span className="hidden sm:inline">Pending</span>
          </TabsTrigger>
          <TabsTrigger value="ready" className="flex items-center gap-2">
            <Truck className="h-4 w-4" /> 
            <span className="hidden sm:inline">In Transit</span>
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" /> 
            <span className="hidden sm:inline">Completed</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Orders ({orders?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : orders?.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No orders in this category</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders?.map((order) => {
                    const items = order.items as any[];
                    return (
                      <div key={order.id} className="border rounded-lg overflow-hidden">
                        <div className={`h-1 ${
                          order.status === "pending" ? "bg-yellow-500" :
                          order.status === "processing" ? "bg-blue-500" :
                          order.status === "dispatched" ? "bg-purple-500" :
                          order.status === "out_for_delivery" ? "bg-orange-500" :
                          "bg-green-500"
                        }`} />
                        <div className="p-4">
                          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {getStatusIcon(order.status)}
                                <span className="font-mono text-sm">#{order.id.slice(0, 8)}</span>
                                {getStatusBadge(order.status)}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(order.created_at), "PPp")}
                              </p>
                              <div className="mt-2">
                                <p className="text-sm font-medium">Items ({items?.length || 0}):</p>
                                <ul className="text-sm text-muted-foreground">
                                  {items?.slice(0, 3).map((item: any, idx: number) => (
                                    <li key={idx}>• {item.name} x{item.quantity}</li>
                                  ))}
                                  {items?.length > 3 && (
                                    <li className="text-xs">...and {items.length - 3} more</li>
                                  )}
                                </ul>
                              </div>

                              {/* Notes */}
                              {order.notes && (
                                <div className="flex items-start gap-2 mt-2 p-2 bg-yellow-50 dark:bg-yellow-950/20 rounded text-sm">
                                  <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 shrink-0" />
                                  <span className="text-yellow-800 dark:text-yellow-200">{order.notes}</span>
                                </div>
                              )}
                            </div>
                            <div className="text-right space-y-2">
                              <p className="font-bold text-lg">{formatCurrency(order.total)}</p>
                              
                              {/* Action buttons based on status */}
                              {order.status === "pending" && (
                                <Button
                                  size="sm"
                                  onClick={() => startPackingMutation.mutate(order.id)}
                                  disabled={startPackingMutation.isPending}
                                >
                                  <Package className="h-4 w-4 mr-1" />
                                  Start Packing
                                </Button>
                              )}
                              
                              {order.status === "processing" && (
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700"
                                  onClick={() => completePackingMutation.mutate(order.id)}
                                  disabled={completePackingMutation.isPending}
                                >
                                  <Truck className="h-4 w-4 mr-1" />
                                  Ready for Pickup
                                </Button>
                              )}

                              {order.status === "out_for_delivery" && (
                                <p className="text-sm text-muted-foreground">
                                  Rider en route
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StoreOrders;
