
import { useState, memo, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { startPacking, completePacking } from "@/services/orderFlowService";
import { Package, CheckCircle, Truck, Clock, AlertCircle, Printer, QrCode, Loader2, RefreshCw } from "lucide-react";
import { formatCurrency } from "@/utils/currencyFormatter";
import DeliveryStickerPreview from "@/components/packer/DeliveryStickerPreview";
import OrderBarcodeScanner from "@/components/packer/OrderBarcodeScanner";
import { motion, AnimatePresence } from "framer-motion";

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { duration: 0.3, ease: "easeOut" }
  },
  exit: { 
    opacity: 0, 
    x: 100, 
    scale: 0.95,
    transition: { duration: 0.25 }
  }
};

interface OrderCardProps {
  order: any;
  onStartPacking: (orderId: string) => void;
  onCompletePacking: (orderId: string, barcode: string) => void;
  isStarting: boolean;
  isCompleting: boolean;
}

const OrderCard = memo(({ order, onStartPacking, onCompletePacking, isStarting, isCompleting }: OrderCardProps) => {
  const [showSticker, setShowSticker] = useState(false);
  
  const items = order.items as any[];
  const isProcessing = order.status === "processing";
  const tracking = order.tracking as Record<string, unknown>;
  const barcode = tracking?.barcode as string;
  const address = order.delivery_address as any;
  const deliveryMethod = (order.delivery_method as any)?.name || "Standard";
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "processing": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const handleScanSuccess = useCallback(() => {
    onCompletePacking(order.id, barcode);
  }, [order.id, barcode, onCompletePacking]);

  return (
    <Card className={`transition-all ${isProcessing ? "ring-2 ring-blue-500" : ""}`}>
      <div className={`h-1 ${isProcessing ? "bg-blue-500" : "bg-yellow-500"}`} />
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <CardTitle className="font-mono text-lg">#{order.id.slice(0,8)}</CardTitle>
            <Badge className={getStatusColor(order.status)}>
              {order.status === "pending" ? "Waiting" : "Packing"}
            </Badge>
            {barcode && (
              <Badge variant="outline" className="font-mono text-xs">
                <QrCode className="h-3 w-3 mr-1" />
                {barcode}
              </Badge>
            )}
          </div>
          <span className="text-sm text-muted-foreground">
            {new Date(order.created_at).toLocaleTimeString()}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Customer Info for sticker */}
        {isProcessing && address && (
          <div className="bg-primary/5 rounded-lg p-3 text-sm">
            <p className="font-medium">{address.fullName || 'Customer'}</p>
            <p className="text-muted-foreground">{address.phone || 'N/A'}</p>
            <p className="text-muted-foreground">{address.street}, {address.city}</p>
          </div>
        )}

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

        {/* Delivery Sticker Preview (when processing) */}
        {isProcessing && barcode && showSticker && (
          <DeliveryStickerPreview
            barcode={barcode}
            customerName={address?.fullName || 'Customer'}
            customerPhone={address?.phone || 'N/A'}
            address={{
              street: address?.street || '',
              city: address?.city || '',
              postalCode: address?.postalCode,
              location: address?.location
            }}
            orderId={order.id}
            deliveryMethod={deliveryMethod}
            orderDate={order.created_at}
          />
        )}

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
              onClick={() => onStartPacking(order.id)}
              disabled={isStarting}
            >
              <Package className="h-4 w-4 mr-2" />
              {isStarting ? "Starting..." : "Start Packing"}
            </Button>
          )}
          {order.status === "processing" && (
            <>
              <Button
                variant="outline"
                onClick={() => setShowSticker(!showSticker)}
              >
                <Printer className="h-4 w-4 mr-2" />
                {showSticker ? "Hide" : "Sticker"}
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

OrderCard.displayName = "OrderCard";

const PackerOrders = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const { data: orders, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ["packer-orders"],
    queryFn: async () => {
      const { data } = await supabase
        .from("orders")
        .select("*")
        .in("status", ["pending", "processing"])
        .order("created_at", { ascending: true });
      return data;
    },
    refetchInterval: 15000,
    staleTime: 10000,
  });

  const startPackingMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const result = await startPacking(orderId, user?.id || "");
      if (!result.success) throw new Error(result.message);
      return result;
    },
    onSuccess: (result) => { 
      queryClient.invalidateQueries({ queryKey: ["packer-orders"] }); 
      toast.success(`Started packing. Barcode: ${result.barcode}`); 
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  const completePackingMutation = useMutation({
    mutationFn: async ({ orderId, barcode }: { orderId: string; barcode: string }) => {
      const result = await completePacking(orderId, user?.id || "", barcode);
      if (!result.success) throw new Error(result.message);
      return result;
    },
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ["packer-orders"] }); 
      toast.success("Order verified and ready for pickup! Inventory updated."); 
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  const handleStartPacking = useCallback((orderId: string) => {
    startPackingMutation.mutate(orderId);
  }, [startPackingMutation]);

  const handleCompletePacking = useCallback((orderId: string, barcode: string) => {
    completePackingMutation.mutate({ orderId, barcode });
  }, [completePackingMutation]);

  const { pendingOrders, processingOrders } = useMemo(() => ({
    pendingOrders: orders?.filter(o => o.status === "pending") || [],
    processingOrders: orders?.filter(o => o.status === "processing") || []
  }), [orders]);

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Order Queue</h1>
          <p className="text-muted-foreground text-sm mt-1">Pack and prepare orders for delivery</p>
        </div>
        <div className="flex gap-2 items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Badge variant="outline" className="gap-1">
            <Clock className="h-3 w-3" />
            {pendingOrders.length}
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <Package className="h-3 w-3" />
            {processingOrders.length}
          </Badge>
        </div>
      </div>

      {!orders?.length ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card>
            <CardContent className="py-16 text-center text-muted-foreground">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Package className="h-8 w-8 opacity-50" />
              </div>
              <p className="font-medium">No orders to pack</p>
              <p className="text-sm mt-1">New orders will appear here automatically</p>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <AnimatePresence mode="popLayout">
            {orders.map((order) => (
              <motion.div
                key={order.id}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                layout
              >
                <OrderCard
                  order={order}
                  onStartPacking={handleStartPacking}
                  onCompletePacking={handleCompletePacking}
                  isStarting={startPackingMutation.isPending && startPackingMutation.variables === order.id}
                  isCompleting={completePackingMutation.isPending}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};

export default PackerOrders;
