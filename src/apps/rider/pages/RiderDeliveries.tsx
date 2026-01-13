
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { formatCurrency } from "@/utils/currencyFormatter";
import { MapPin, Phone, Package, Navigation, CheckCircle } from "lucide-react";

const RiderDeliveries = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: deliveries, isLoading } = useQuery({
    queryKey: ["rider-deliveries", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("assigned_to", user?.id)
        .in("status", ["dispatched", "out_for_delivery"])
        .order("created_at", { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const { error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", orderId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rider-deliveries"] });
      queryClient.invalidateQueries({ queryKey: ["rider-dashboard"] });
      toast.success("Status updated!");
    },
    onError: () => {
      toast.error("Failed to update status");
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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Active Deliveries</h1>

      {!deliveries?.length ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No active deliveries</p>
            <p className="text-sm text-muted-foreground">Check back later for new assignments</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {deliveries.map((order) => {
            const address = order.delivery_address as any;
            const items = order.items as any[];
            
            return (
              <Card key={order.id} className="overflow-hidden">
                <div className={`h-2 ${order.status === "out_for_delivery" ? "bg-green-500" : "bg-orange-500"}`} />
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-mono">#{order.id.slice(0, 8)}</CardTitle>
                    <Badge className={order.status === "out_for_delivery" ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"}>
                      {order.status === "out_for_delivery" ? "In Transit" : "Ready for Pickup"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Address */}
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
                      {items?.length > 3 && <p>...and {items.length - 3} more</p>}
                    </div>
                    <p className="font-bold">{formatCurrency(order.total)}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    {order.status === "dispatched" && (
                      <Button 
                        className="flex-1"
                        onClick={() => updateStatusMutation.mutate({ orderId: order.id, status: "out_for_delivery" })}
                      >
                        <Package className="h-4 w-4 mr-2" />
                        Start Delivery
                      </Button>
                    )}
                    {order.status === "out_for_delivery" && (
                      <Button 
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() => updateStatusMutation.mutate({ orderId: order.id, status: "delivered" })}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Complete Delivery
                      </Button>
                    )}
                  </div>

                  {/* Customer Contact */}
                  {order.notes && (
                    <div className="text-sm text-muted-foreground bg-yellow-50 dark:bg-yellow-950/20 p-2 rounded">
                      <span className="font-medium">Notes:</span> {order.notes}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RiderDeliveries;
