
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  Package, 
  MapPin, 
  Phone, 
  Truck, 
  CheckCircle2, 
  Building2, 
  Navigation,
  PackageCheck,
  Warehouse,
  Route
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { Order } from "@/types";
import { motion } from "framer-motion";

interface OrderTrackingProps {
  order: Order;
}

const OrderTracking = ({ order }: OrderTrackingProps) => {
  // Helper function to get status badge color
  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pending": return "bg-yellow-500";
      case "processing": return "bg-blue-500";
      case "dispatched": return "bg-purple-500";
      case "out_for_delivery": return "bg-orange-500";
      case "delivered": return "bg-green-500";
      case "cancelled": return "bg-red-500";
      default: return "bg-muted";
    }
  };

  // Helper to get icon based on event type/location
  const getEventIcon = (event: { status: string; location?: string; description?: string }) => {
    const desc = event.description?.toLowerCase() || '';
    const loc = event.location?.toLowerCase() || '';
    
    if (desc.includes('delivered') || event.status === 'delivered') {
      return <CheckCircle2 className="h-4 w-4 text-white" />;
    }
    if (desc.includes('out for delivery') || event.status === 'out_for_delivery') {
      return <Truck className="h-4 w-4 text-white" />;
    }
    if (loc.includes('warehouse') || desc.includes('warehouse')) {
      return <Warehouse className="h-4 w-4 text-white" />;
    }
    if (loc.includes('sorting') || loc.includes('hub') || desc.includes('hub')) {
      return <Building2 className="h-4 w-4 text-white" />;
    }
    if (desc.includes('packed') || desc.includes('packing')) {
      return <PackageCheck className="h-4 w-4 text-white" />;
    }
    if (desc.includes('route') || desc.includes('transit') || desc.includes('departed') || desc.includes('left')) {
      return <Route className="h-4 w-4 text-white" />;
    }
    return <Package className="h-4 w-4 text-white" />;
  };

  // Get badge variant based on location type
  const getLocationBadge = (location: string) => {
    const loc = location.toLowerCase();
    if (loc.includes('warehouse')) {
      return { variant: "secondary" as const, icon: <Warehouse className="h-3 w-3 mr-1" /> };
    }
    if (loc.includes('hub') || loc.includes('sorting')) {
      return { variant: "outline" as const, icon: <Building2 className="h-3 w-3 mr-1" /> };
    }
    if (loc.includes('route') || loc.includes('transit')) {
      return { variant: "default" as const, icon: <Navigation className="h-3 w-3 mr-1" /> };
    }
    return { variant: "outline" as const, icon: <MapPin className="h-3 w-3 mr-1" /> };
  };

  // Status progression steps
  const statusSteps = [
    { status: "pending", label: "Order Placed", icon: Package },
    { status: "processing", label: "Packing", icon: PackageCheck },
    { status: "dispatched", label: "Dispatched", icon: Truck },
    { status: "out_for_delivery", label: "Out for Delivery", icon: Navigation },
    { status: "delivered", label: "Delivered", icon: CheckCircle2 },
  ];

  const currentStepIndex = statusSteps.findIndex(s => s.status === order.status);

  return (
    <Card className="mb-8 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 py-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Order Tracking
          </CardTitle>
          <Badge className={`${getStatusColor(order.status)} text-white capitalize`}>
            {order.status.replace("_", " ")}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {/* Status Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {statusSteps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;
              
              return (
                <div key={step.status} className="flex flex-col items-center flex-1">
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      isCompleted 
                        ? isCurrent 
                          ? 'bg-primary ring-4 ring-primary/20' 
                          : 'bg-primary/80' 
                        : 'bg-muted'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${isCompleted ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                  </motion.div>
                  <span className={`text-xs mt-2 text-center ${isCurrent ? 'font-semibold text-primary' : 'text-muted-foreground'}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
          {/* Progress line */}
          <div className="relative h-1 bg-muted rounded-full mx-5 -mt-14 mb-10">
            <motion.div 
              className="absolute h-1 bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Estimated Delivery */}
        <div className="flex items-center mb-6 p-4 bg-muted/30 rounded-lg">
          <Clock className="h-5 w-5 text-primary mr-3" />
          <div>
            <span className="text-sm text-muted-foreground">Estimated Delivery</span>
            <p className="font-semibold">{order.estimatedDelivery}</p>
          </div>
        </div>
        
        {/* Tracking timeline */}
        <div className="relative">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Route className="h-4 w-4" />
            Tracking History
          </h3>
          
          {order.tracking?.events && order.tracking.events.length > 0 ? (
            <div className="space-y-1">
              {order.tracking.events.slice().reverse().map((event, index) => {
                const isFirst = index === 0;
                const locationBadge = event.location ? getLocationBadge(event.location) : null;
                
                return (
                  <motion.div 
                    key={index} 
                    className="flex gap-4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    {/* Timeline line and dot */}
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isFirst ? getStatusColor(event.status) : 'bg-muted'
                      }`}>
                        {getEventIcon(event)}
                      </div>
                      {index < order.tracking!.events.length - 1 && (
                        <div className="w-0.5 h-full min-h-[40px] bg-muted" />
                      )}
                    </div>
                    
                    {/* Event details */}
                    <div className={`flex-1 pb-4 ${isFirst ? '' : 'opacity-75'}`}>
                      <p className={`font-medium ${isFirst ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {event.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(event.timestamp), "MMM d, yyyy 'at' h:mm a")}
                        </span>
                        {isFirst && (
                          <Badge variant="secondary" className="text-xs">
                            {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                          </Badge>
                        )}
                      </div>
                      {event.location && locationBadge && (
                        <Badge variant={locationBadge.variant} className="mt-2 text-xs">
                          {locationBadge.icon}
                          {event.location}
                        </Badge>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Tracking information will appear here as your order progresses.</p>
            </div>
          )}
        </div>
        
        {/* Driver information for out-for-delivery orders */}
        {(order.status === "out_for_delivery" && order.tracking?.driver) && (
          <motion.div 
            className="mt-6 p-4 border rounded-lg bg-gradient-to-r from-primary/5 to-transparent"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Your Delivery Driver
            </h3>
            <div className="flex items-center">
              <div className="w-14 h-14 rounded-full overflow-hidden mr-4 ring-2 ring-primary/20">
                <img 
                  src={order.tracking.driver.photo} 
                  alt={order.tracking.driver.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <p className="font-semibold">{order.tracking.driver.name}</p>
                <a 
                  href={`tel:${order.tracking.driver.phone}`}
                  className="text-sm text-primary flex items-center gap-1 hover:underline"
                >
                  <Phone className="h-3 w-3" />
                  {order.tracking.driver.phone}
                </a>
              </div>
            </div>
          </motion.div>
        )}

        {/* Delivery signature if delivered */}
        {order.status === "delivered" && order.tracking?.signature && (
          <motion.div 
            className="mt-6 p-4 border rounded-lg bg-green-50 dark:bg-green-950/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-green-700 dark:text-green-400">
              <CheckCircle2 className="h-4 w-4" />
              Delivery Confirmed
            </h3>
            <div className="bg-white dark:bg-background rounded p-3 border">
              <p className="text-xs text-muted-foreground mb-2">Customer Signature</p>
              <img 
                src={order.tracking.signature} 
                alt="Customer signature" 
                className="max-h-20 object-contain"
              />
            </div>
            {order.tracking.deliveredAt && (
              <p className="text-sm text-muted-foreground mt-2">
                Delivered on {format(new Date(order.tracking.deliveredAt), "MMMM d, yyyy 'at' h:mm a")}
              </p>
            )}
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderTracking;
