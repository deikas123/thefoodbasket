
import { Order } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  Clock, 
  Package, 
  Truck, 
  MapPin, 
  ChevronRight,
  PackageCheck,
  Navigation,
  CheckCircle2
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { formatCurrency } from "@/utils/currencyFormatter";
import { motion } from "framer-motion";

interface OrderCardProps {
  order: Order;
  onViewOrder: (orderId: string) => void;
}

const OrderCard = ({ order, onViewOrder }: OrderCardProps) => {
  // Helper function to get status badge styling
  const getStatusBadge = (status: Order["status"]) => {
    switch (status) {
      case "pending": 
        return { color: "bg-yellow-500 hover:bg-yellow-600", icon: Clock, label: "Pending" };
      case "processing": 
        return { color: "bg-blue-500 hover:bg-blue-600", icon: PackageCheck, label: "Packing" };
      case "dispatched": 
        return { color: "bg-purple-500 hover:bg-purple-600", icon: Package, label: "Dispatched" };
      case "out_for_delivery": 
        return { color: "bg-orange-500 hover:bg-orange-600", icon: Navigation, label: "Out for Delivery" };
      case "delivered": 
        return { color: "bg-green-500 hover:bg-green-600", icon: CheckCircle2, label: "Delivered" };
      case "cancelled": 
        return { color: "bg-red-500 hover:bg-red-600", icon: Package, label: "Cancelled" };
      default: 
        return { color: "bg-muted", icon: Package, label: status };
    }
  };

  // Calculate progress percentage
  const getProgressPercentage = (status: Order["status"]) => {
    const statusOrder = ["pending", "processing", "dispatched", "out_for_delivery", "delivered"];
    const index = statusOrder.indexOf(status);
    if (status === "cancelled") return 0;
    return ((index + 1) / statusOrder.length) * 100;
  };

  // Get latest tracking event
  const latestEvent = order.tracking?.events?.length 
    ? order.tracking.events[order.tracking.events.length - 1] 
    : null;

  const statusInfo = getStatusBadge(order.status);
  const StatusIcon = statusInfo.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="hover:shadow-lg transition-all overflow-hidden group">
        {/* Progress bar at top */}
        {order.status !== "cancelled" && (
          <Progress 
            value={getProgressPercentage(order.status)} 
            className="h-1 rounded-none"
          />
        )}
        
        <CardHeader className="py-4">
          <div className="flex flex-wrap justify-between items-start gap-2">
            <div className="space-y-1">
              <CardTitle className="text-lg md:text-xl flex items-center gap-2">
                <span className="font-mono text-sm text-muted-foreground">#{order.id.slice(0, 8)}</span>
                <Badge className={`${statusInfo.color} text-white`}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {statusInfo.label}
                </Badge>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Placed {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
              </p>
            </div>
            <Button 
              onClick={() => onViewOrder(order.id)}
              className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
              variant="outline"
              size="sm"
            >
              Track Order
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="pb-6">
          <div className="space-y-4">
            {/* Latest tracking event */}
            {latestEvent && (
              <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                <div className={`p-2 rounded-full ${statusInfo.color}`}>
                  <Truck className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{latestEvent.description}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(latestEvent.timestamp), "MMM d, h:mm a")}
                    </span>
                    {latestEvent.location && (
                      <Badge variant="outline" className="text-xs">
                        <MapPin className="h-3 w-3 mr-1" />
                        {latestEvent.location}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Estimated delivery */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-muted-foreground mr-2" />
                <span className="text-sm">
                  {order.status === "delivered" ? "Delivered" : "Est. Delivery"}: 
                  <span className="font-medium ml-1">{order.estimatedDelivery}</span>
                </span>
              </div>
              <div className="flex items-center">
                <Package className="h-4 w-4 text-muted-foreground mr-2" />
                <span className="text-sm">
                  <span className="font-medium">{order.items.reduce((sum, item) => sum + item.quantity, 0)}</span> items
                </span>
              </div>
            </div>
            
            <Separator />
            
            {/* Order items preview */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex -space-x-2">
                {order.items.slice(0, 4).map((item, index) => (
                  <div 
                    key={item.productId} 
                    className="h-10 w-10 rounded-full bg-muted overflow-hidden ring-2 ring-background"
                    style={{ zIndex: 4 - index }}
                  >
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {order.items.slice(0, 3).map(i => i.name).join(", ")}
                {order.items.length > 3 && ` +${order.items.length - 3} more`}
              </span>
            </div>
            
            <Separator />
            
            {/* Footer */}
            <div className="flex justify-between items-center">
              <div className="flex items-center text-sm text-muted-foreground">
                <Truck className="h-4 w-4 mr-2" />
                {order.deliveryMethod.name}
              </div>
              <div className="text-lg font-bold">
                {formatCurrency(order.total)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default OrderCard;
