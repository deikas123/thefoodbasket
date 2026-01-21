
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
import { ShoppingCart, Clock, CheckCircle, Package, Truck, AlertCircle, Loader2, RefreshCw, ChevronRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";

interface StoreOrdersProps {
  storeId: string | null;
}

const orderCardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { duration: 0.3, ease: "easeOut" }
  },
  exit: { 
    opacity: 0, 
    x: -100, 
    scale: 0.95,
    transition: { duration: 0.2 }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const StoreOrders: React.FC<StoreOrdersProps> = ({ storeId }) => {
  const [activeTab, setActiveTab] = useState("pending");
  const queryClient = useQueryClient();

  const { data: orders, isLoading, isRefetching, refetch } = useQuery({
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
    refetchInterval: 15000,
  });

  const startPackingMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const result = await startPacking(orderId, "store");
      if (!result.success) throw new Error(result.message);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store-orders"] });
      toast.success("Order packing started! 📦");
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
      toast.success("Order ready for delivery! Inventory updated. 🚚");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200",
      processing: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200",
      dispatched: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200",
      out_for_delivery: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200",
      delivered: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200",
    };
    const labels: Record<string, string> = {
      pending: "Awaiting",
      processing: "Packing",
      dispatched: "Ready",
      out_for_delivery: "Delivering",
      delivered: "Delivered"
    };
    return <Badge className={`${variants[status] || "bg-muted"} border`}>{labels[status] || status}</Badge>;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="h-4 w-4 text-amber-500" />;
      case "processing": return <Package className="h-4 w-4 text-blue-500 animate-pulse" />;
      case "dispatched": return <CheckCircle className="h-4 w-4 text-purple-500" />;
      case "out_for_delivery": return <Truck className="h-4 w-4 text-orange-500" />;
      case "delivered": return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-amber-500";
      case "processing": return "bg-blue-500";
      case "dispatched": return "bg-purple-500";
      case "out_for_delivery": return "bg-orange-500";
      case "delivered": return "bg-emerald-500";
      default: return "bg-muted";
    }
  };

  const pendingCount = orders?.filter(o => o.status === "pending").length || 0;
  const processingCount = orders?.filter(o => o.status === "processing").length || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Order Management</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage store orders from packing to dispatch
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isRefetching}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 h-12">
          <TabsTrigger value="pending" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Clock className="h-4 w-4" /> 
            <span className="hidden sm:inline">Pending</span>
            {pendingCount + processingCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1.5">{pendingCount + processingCount}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="ready" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Truck className="h-4 w-4" /> 
            <span className="hidden sm:inline">In Transit</span>
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <CheckCircle className="h-4 w-4" /> 
            <span className="hidden sm:inline">Completed</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <ShoppingCart className="h-5 w-5" />
                Orders ({orders?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-28 bg-muted animate-pulse rounded-lg" />
                  ))}
                </motion.div>
              ) : orders?.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-16 text-muted-foreground"
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                    <ShoppingCart className="h-8 w-8 opacity-50" />
                  </div>
                  <p className="font-medium">No orders in this category</p>
                  <p className="text-sm mt-1">New orders will appear here automatically</p>
                </motion.div>
              ) : (
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  className="space-y-4"
                >
                  <AnimatePresence mode="popLayout">
                    {orders?.map((order) => {
                      const items = order.items as any[];
                      const isStartingPacking = startPackingMutation.isPending && startPackingMutation.variables === order.id;
                      const isCompletingPacking = completePackingMutation.isPending && completePackingMutation.variables === order.id;
                      
                      return (
                        <motion.div
                          key={order.id}
                          variants={orderCardVariants}
                          layout
                          className="border rounded-xl overflow-hidden bg-card hover:shadow-md transition-shadow"
                        >
                          {/* Status indicator bar */}
                          <div className={`h-1.5 ${getStatusColor(order.status)}`} />
                          
                          <div className="p-4">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                {/* Order header */}
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                  {getStatusIcon(order.status)}
                                  <span className="font-mono text-sm font-medium">#{order.id.slice(0, 8)}</span>
                                  {getStatusBadge(order.status)}
                                  {order.status === "processing" && (
                                    <span className="text-xs text-blue-600 dark:text-blue-400 animate-pulse">
                                      In Progress...
                                    </span>
                                  )}
                                </div>
                                
                                <p className="text-sm text-muted-foreground">
                                  {format(new Date(order.created_at), "PPp")}
                                </p>
                                
                                {/* Items list */}
                                <div className="mt-3">
                                  <p className="text-sm font-medium mb-1">
                                    Items ({items?.length || 0}):
                                  </p>
                                  <ul className="text-sm text-muted-foreground space-y-0.5">
                                    {items?.slice(0, 3).map((item: any, idx: number) => (
                                      <li key={idx} className="flex items-center gap-1">
                                        <ChevronRight className="h-3 w-3" />
                                        {item.name} <span className="text-foreground font-medium">×{item.quantity}</span>
                                      </li>
                                    ))}
                                    {items?.length > 3 && (
                                      <li className="text-xs italic">...and {items.length - 3} more items</li>
                                    )}
                                  </ul>
                                </div>

                                {/* Special notes */}
                                {order.notes && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    className="flex items-start gap-2 mt-3 p-2.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg text-sm"
                                  >
                                    <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                                    <span className="text-amber-800 dark:text-amber-200">{order.notes}</span>
                                  </motion.div>
                                )}
                              </div>
                              
                              {/* Right side - Price and actions */}
                              <div className="text-right space-y-3 shrink-0">
                                <p className="font-bold text-xl">{formatCurrency(order.total)}</p>
                                
                                {/* Action buttons based on status */}
                                {order.status === "pending" && (
                                  <Button
                                    size="sm"
                                    onClick={() => startPackingMutation.mutate(order.id)}
                                    disabled={isStartingPacking}
                                    className="min-w-[140px]"
                                  >
                                    {isStartingPacking ? (
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                      <Package className="h-4 w-4 mr-2" />
                                    )}
                                    Start Packing
                                  </Button>
                                )}
                                
                                {order.status === "processing" && (
                                  <Button
                                    size="sm"
                                    className="min-w-[140px] bg-emerald-600 hover:bg-emerald-700"
                                    onClick={() => completePackingMutation.mutate(order.id)}
                                    disabled={isCompletingPacking}
                                  >
                                    {isCompletingPacking ? (
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                      <Truck className="h-4 w-4 mr-2" />
                                    )}
                                    Ready for Pickup
                                  </Button>
                                )}

                                {order.status === "out_for_delivery" && (
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground justify-end">
                                    <Truck className="h-4 w-4 animate-bounce" />
                                    <span>Rider en route</span>
                                  </div>
                                )}

                                {order.status === "delivered" && (
                                  <div className="flex items-center gap-2 text-sm text-emerald-600 justify-end">
                                    <CheckCircle className="h-4 w-4" />
                                    <span>Completed</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StoreOrders;
