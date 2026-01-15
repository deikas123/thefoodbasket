
import { memo, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { startDelivery, completeDelivery } from "@/services/orderFlowService";
import { formatCurrency } from "@/utils/currencyFormatter";
import { MapPin, Package, Navigation, Truck, Clock, Phone, QrCode, Route } from "lucide-react";
import OrderBarcodeScanner from "@/components/packer/OrderBarcodeScanner";
import { optimizeDeliveryRoute, OptimizedRoute } from "@/services/routeOptimizationService";

interface DeliveryCardProps {
  order: any;
  onStartDelivery: (orderId: string) => void;
  onCompleteDelivery: (orderId: string, barcode: string) => void;
  isStarting: boolean;
  isCompleting: boolean;
  isMyDelivery: boolean;
}

const DeliveryCard = memo(({ 
  order, 
  onStartDelivery, 
  onCompleteDelivery, 
  isStarting, 
  isCompleting,
  isMyDelivery 
}: DeliveryCardProps) => {
  const address = order.delivery_address as any;
  const items = order.items as any[];
  const tracking = order.tracking as Record<string, unknown>;
  const barcode = tracking?.barcode as string;
  const isInTransit = order.status === "out_for_delivery";
  const deliveryMethod = (order.delivery_method as any)?.name || "Standard";
  const isExpress = deliveryMethod.toLowerCase().includes('express');

  const openNavigation = useCallback(() => {
    if (address?.location) {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${address.location.lat},${address.location.lng}`,
        "_blank"
      );
    } else {
      const query = `${address?.street}, ${address?.city}`;
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`, "_blank");
    }
  }, [address]);

  const handleScanSuccess = useCallback(() => {
    onCompleteDelivery(order.id, barcode);
  }, [order.id, barcode, onCompleteDelivery]);

  return (
    <Card className={`overflow-hidden ${isMyDelivery ? '' : 'border-orange-200 dark:border-orange-900'}`}>
      <div className={`h-2 ${
        isInTransit ? "bg-green-500" : 
        isMyDelivery ? "bg-blue-500" : 
        "bg-orange-500"
      }`} />
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg font-mono">#{order.id.slice(0, 8)}</CardTitle>
            {barcode && (
              <Badge variant="outline" className="font-mono text-xs">
                <QrCode className="h-3 w-3 mr-1" />
                {barcode}
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Badge variant={isExpress ? "destructive" : "secondary"}>
              {deliveryMethod}
            </Badge>
            <Badge className={
              isInTransit ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" :
              isMyDelivery ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" :
              "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
            }>
              {isInTransit ? "In Transit" : isMyDelivery ? "Picked Up" : "Ready for Pickup"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Customer Info */}
        <div className="bg-muted/50 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="font-medium">{address?.fullName || 'Customer'}</span>
            </div>
            {address?.phone && (
              <a 
                href={`tel:${address.phone}`}
                className="flex items-center gap-1 text-sm text-primary hover:underline"
              >
                <Phone className="h-3 w-3" />
                {address.phone}
              </a>
            )}
          </div>
          <div className="text-sm">
            <p>{address?.street}</p>
            <p className="text-muted-foreground">{address?.city}{address?.postalCode ? `, ${address.postalCode}` : ''}</p>
          </div>
          {address?.location && (
            <p className="text-xs text-muted-foreground">
              GPS: {address.location.lat.toFixed(4)}, {address.location.lng.toFixed(4)}
            </p>
          )}
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

        {/* Delivery instructions */}
        {address?.instructions && (
          <div className="text-sm bg-blue-50 dark:bg-blue-950/20 p-2 rounded">
            <span className="font-medium">Instructions:</span> {address.instructions}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {!isMyDelivery && (
            <Button 
              className="flex-1"
              onClick={() => onStartDelivery(order.id)}
              disabled={isStarting}
            >
              <Package className="h-4 w-4 mr-2" />
              {isStarting ? "Starting..." : "Pick Up & Start Delivery"}
            </Button>
          )}
          
          {isMyDelivery && !isInTransit && (
            <Button 
              className="flex-1"
              onClick={() => onStartDelivery(order.id)}
              disabled={isStarting}
            >
              <Truck className="h-4 w-4 mr-2" />
              {isStarting ? "Starting..." : "Start Delivery"}
            </Button>
          )}
          
          {isInTransit && (
            <>
              <Button 
                variant="outline" 
                onClick={openNavigation}
                className="flex-1"
              >
                <Navigation className="h-4 w-4 mr-2" />
                Navigate
              </Button>
              <OrderBarcodeScanner
                expectedBarcode={barcode}
                onScanSuccess={handleScanSuccess}
                buttonText={isCompleting ? "Verifying..." : "Scan & Complete"}
                buttonClassName="flex-1 bg-green-600 hover:bg-green-700"
                disabled={isCompleting}
              />
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

DeliveryCard.displayName = "DeliveryCard";

// Route optimization summary component
const RouteOptimizationCard = memo(({ route }: { route: OptimizedRoute }) => (
  <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
    <CardContent className="py-4">
      <div className="flex items-center gap-4">
        <div className="p-2 bg-primary/20 rounded-lg">
          <Route className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1">
          <p className="font-medium">Optimized Route</p>
          <p className="text-sm text-muted-foreground">
            {route.stops.length} stops • {route.totalDistance} km • ~{route.totalTime} min
          </p>
        </div>
        {route.efficiency > 0 && (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            {route.efficiency}% more efficient
          </Badge>
        )}
      </div>
    </CardContent>
  </Card>
));

RouteOptimizationCard.displayName = "RouteOptimizationCard";

const RiderDeliveries = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: deliveries, isLoading } = useQuery({
    queryKey: ["rider-deliveries", user?.id],
    queryFn: async () => {
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
    refetchInterval: 15000,
    staleTime: 10000,
  });

  // Calculate optimized route for active deliveries
  const optimizedRoute = useMemo(() => {
    if (!deliveries?.length) return null;
    const activeDeliveries = deliveries.filter(d => 
      d.assigned_to === user?.id || d.status === "dispatched"
    );
    if (activeDeliveries.length < 2) return null;
    return optimizeDeliveryRoute(activeDeliveries);
  }, [deliveries, user?.id]);

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
    mutationFn: async ({ orderId, barcode }: { orderId: string; barcode: string }) => {
      const result = await completeDelivery(orderId, user?.id || "", barcode);
      if (!result.success) throw new Error(result.message);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rider-deliveries"] });
      queryClient.invalidateQueries({ queryKey: ["rider-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["rider-history"] });
      toast.success("Delivery verified and completed! Great job!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleStartDelivery = useCallback((orderId: string) => {
    startDeliveryMutation.mutate(orderId);
  }, [startDeliveryMutation]);

  const handleCompleteDelivery = useCallback((orderId: string, barcode: string) => {
    completeDeliveryMutation.mutate({ orderId, barcode });
  }, [completeDeliveryMutation]);

  const { availablePickups, myDeliveries } = useMemo(() => ({
    availablePickups: deliveries?.filter(d => d.status === "dispatched" && !d.assigned_to) || [],
    myDeliveries: deliveries?.filter(d => d.assigned_to === user?.id) || []
  }), [deliveries, user?.id]);

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

      {/* Route Optimization */}
      {optimizedRoute && <RouteOptimizationCard route={optimizedRoute} />}

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
              {availablePickups.map((order) => (
                <DeliveryCard
                  key={order.id}
                  order={order}
                  onStartDelivery={handleStartDelivery}
                  onCompleteDelivery={handleCompleteDelivery}
                  isStarting={startDeliveryMutation.isPending}
                  isCompleting={completeDeliveryMutation.isPending}
                  isMyDelivery={false}
                />
              ))}
            </div>
          )}

          {/* Active Deliveries Section */}
          {myDeliveries.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Truck className="h-5 w-5 text-green-500" />
                My Active Deliveries
              </h2>
              {myDeliveries.map((order) => (
                <DeliveryCard
                  key={order.id}
                  order={order}
                  onStartDelivery={handleStartDelivery}
                  onCompleteDelivery={handleCompleteDelivery}
                  isStarting={startDeliveryMutation.isPending}
                  isCompleting={completeDeliveryMutation.isPending}
                  isMyDelivery={true}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RiderDeliveries;
