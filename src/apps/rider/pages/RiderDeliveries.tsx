
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { startDelivery, completeDelivery } from "@/services/orderFlowService";
import { formatCurrency } from "@/utils/currencyFormatter";
import { MapPin, Package, Navigation, CheckCircle, Truck, Clock, Phone } from "lucide-react";

const RiderDeliveries = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch both assigned deliveries and available pickups
  const { data: deliveries, isLoading } = useQuery({
    queryKey: ["rider-deliveries", user?.id],
    queryFn: async () => {
      // Get orders assigned to this rider OR dispatched orders available for pickup
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .or(`assigned_to.eq.${user?.id},and(status.eq.dispatched,assigned_to.is.null)`)
        .in("status", ["dispatched", "out_for_delivery"])
        .order("created_at", { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const startDeliveryMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const result = await startDelivery(orderId, user?.id || "");
      if (!result.success) throw new Error(result.message);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rider-deliveries"] });
      queryClient.invalidateQueries({ queryKey: ["rider-dashboard"] });
      toast.success("Delivery started! Customer has been notified.");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const completeDeliveryMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const result = await completeDelivery(orderId, user?.id || "");
      if (!result.success) throw new Error(result.message);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rider-deliveries"] });
      queryClient.invalidateQueries({ queryKey: ["rider-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["rider-history"] });
      toast.success("Delivery completed! Great job!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const openNavigation = (address: any) => {
    const query = `${address.street}, ${address.city}`;
    const encodedQuery = encodeURIComponent(query);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedQuery}`, "_blank");
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-32 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const availablePickups = deliveries?.filter(d => d.status === "dispatched" && !d.assigned_to) || [];
  const myDeliveries = deliveries?.filter(d => d.assigned_to === user?.id) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Deliveries</h1>
        <div className="flex gap-2">
          <Badge variant="outline" className="gap-1">
            <Package className="h-3 w-3" />
            Available: {availablePickups.length}
          </Badge>
          <Badge variant="outline" className="gap-1 bg-green-50 dark:bg-green-950">
            <Truck className="h-3 w-3" />
            Active: {myDeliveries.length}
          </Badge>
        </div>
      </div>

      {!deliveries?.length ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="font-medium text-muted-foreground">No deliveries available</p>
            <p className="text-sm text-muted-foreground">Check back later for new assignments</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Available Pickups Section */}
          {availablePickups.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-500" />
                Available for Pickup
              </h2>
              {availablePickups.map((order) => {
                const address = order.delivery_address as any;
                const items = order.items as any[];
                
                return (
                  <Card key={order.id} className="overflow-hidden border-orange-200 dark:border-orange-900">
                    <div className="h-2 bg-orange-500" />
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-mono">#{order.id.slice(0, 8)}</CardTitle>
                        <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
                          Ready for Pickup
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                        <MapPin className="h-5 w-5 text-primary mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium">{address?.street}</p>
                          <p className="text-sm text-muted-foreground">{address?.city}, {address?.state}</p>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">{items?.length || 0} items</span>
                        <span className="font-bold">{formatCurrency(order.total)}</span>
                      </div>

                      <Button 
                        className="w-full"
                        onClick={() => startDeliveryMutation.mutate(order.id)}
                        disabled={startDeliveryMutation.isPending}
                      >
                        <Package className="h-4 w-4 mr-2" />
                        {startDeliveryMutation.isPending ? "Starting..." : "Pick Up & Start Delivery"}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Active Deliveries Section */}
          {myDeliveries.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Truck className="h-5 w-5 text-green-500" />
                My Active Deliveries
              </h2>
              {myDeliveries.map((order) => {
                const address = order.delivery_address as any;
                const items = order.items as any[];
                const isInTransit = order.status === "out_for_delivery";
                
                return (
                  <Card key={order.id} className="overflow-hidden">
                    <div className={`h-2 ${isInTransit ? "bg-green-500" : "bg-blue-500"}`} />
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-mono">#{order.id.slice(0, 8)}</CardTitle>
                        <Badge className={isInTransit 
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" 
                          : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                        }>
                          {isInTransit ? "In Transit" : "Picked Up"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Address with navigation */}
                      <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                        <MapPin className="h-5 w-5 text-primary mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium">{address?.street}</p>
                          <p className="text-sm text-muted-foreground">{address?.city}, {address?.state}</p>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => openNavigation(address)}>
                          <Navigation className="h-4 w-4 mr-1" />
                          Navigate
                        </Button>
                      </div>

                      {/* Order Details */}
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Items ({items?.length || 0}):</p>
                        <div className="text-sm text-muted-foreground">
                          {items?.slice(0, 3).map((item: any, idx: number) => (
                            <p key={idx}>• {item.name} x{item.quantity}</p>
                          ))}
                          {items?.length > 3 && <p className="text-xs">...and {items.length - 3} more</p>}
                        </div>
                        <p className="font-bold">{formatCurrency(order.total)}</p>
                      </div>

                      {/* Notes */}
                      {order.notes && (
                        <div className="text-sm text-muted-foreground bg-yellow-50 dark:bg-yellow-950/20 p-2 rounded">
                          <span className="font-medium">Notes:</span> {order.notes}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        {order.status === "dispatched" && (
                          <Button 
                            className="flex-1"
                            onClick={() => startDeliveryMutation.mutate(order.id)}
                            disabled={startDeliveryMutation.isPending}
                          >
                            <Truck className="h-4 w-4 mr-2" />
                            {startDeliveryMutation.isPending ? "Starting..." : "Start Delivery"}
                          </Button>
                        )}
                        {order.status === "out_for_delivery" && (
                          <Button 
                            className="flex-1 bg-green-600 hover:bg-green-700"
                            onClick={() => completeDeliveryMutation.mutate(order.id)}
                            disabled={completeDeliveryMutation.isPending}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            {completeDeliveryMutation.isPending ? "Completing..." : "Complete Delivery"}
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
      )}
    </div>
  );
};

export default RiderDeliveries;
