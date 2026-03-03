
import { Card, CardContent } from "@/components/ui/card";
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
  Route,
  User
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { Order } from "@/types";
import { motion } from "framer-motion";

interface OrderTrackingProps {
  order: Order;
}

const OrderTracking = ({ order }: OrderTrackingProps) => {
  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pending": return "bg-accent text-accent-foreground";
      case "processing": return "bg-primary text-primary-foreground";
      case "dispatched": return "bg-chart-4 text-primary-foreground";
      case "out_for_delivery": return "bg-chart-5 text-primary-foreground";
      case "delivered": return "bg-chart-3 text-primary-foreground";
      case "cancelled": return "bg-destructive text-destructive-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getEventIcon = (event: { status: string; location?: string; description?: string }) => {
    const desc = event.description?.toLowerCase() || '';
    const loc = event.location?.toLowerCase() || '';
    if (desc.includes('delivered') || event.status === 'delivered') return <CheckCircle2 className="h-4 w-4" />;
    if (desc.includes('out for delivery') || event.status === 'out_for_delivery') return <Truck className="h-4 w-4" />;
    if (loc.includes('warehouse') || desc.includes('warehouse')) return <Warehouse className="h-4 w-4" />;
    if (loc.includes('sorting') || loc.includes('hub')) return <Building2 className="h-4 w-4" />;
    if (desc.includes('packed') || desc.includes('packing')) return <PackageCheck className="h-4 w-4" />;
    if (desc.includes('route') || desc.includes('transit') || desc.includes('departed')) return <Route className="h-4 w-4" />;
    return <Package className="h-4 w-4" />;
  };

  const statusSteps = [
    { status: "pending", label: "Order Placed", icon: Package },
    { status: "processing", label: "Packing", icon: PackageCheck },
    { status: "dispatched", label: "Dispatched", icon: Truck },
    { status: "out_for_delivery", label: "Out for Delivery", icon: Navigation },
    { status: "delivered", label: "Delivered", icon: CheckCircle2 },
  ];

  const currentStepIndex = statusSteps.findIndex(s => s.status === order.status);
  const isCancelled = order.status === "cancelled";

  const formattedEstimatedDelivery = (() => {
    try {
      const date = new Date(order.estimatedDelivery);
      if (isNaN(date.getTime())) return order.estimatedDelivery;
      return format(date, "EEE, MMM d, yyyy 'at' h:mm a");
    } catch {
      return order.estimatedDelivery;
    }
  })();

  return (
    <Card className="mb-8 overflow-hidden border-0 shadow-lg">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-[hsl(var(--rally-navy))] to-[hsl(var(--rally-navy)/0.85)] p-4 sm:p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-primary-foreground flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Order Tracking
          </h2>
          <Badge className={`${getStatusColor(order.status)} capitalize text-xs sm:text-sm px-3 py-1`}>
            {order.status.replace("_", " ")}
          </Badge>
        </div>

        {/* Status Steps - Horizontal on desktop, compact on mobile */}
        {!isCancelled && (
          <div className="relative">
            {/* Progress bar background */}
            <div className="absolute top-5 left-5 right-5 h-0.5 bg-primary-foreground/20 hidden sm:block" />
            <motion.div
              className="absolute top-5 left-5 h-0.5 bg-primary hidden sm:block"
              initial={{ width: 0 }}
              animate={{ width: `calc(${(currentStepIndex / (statusSteps.length - 1)) * 100}% - 40px)` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />

            <div className="flex items-start justify-between gap-1">
              {statusSteps.map((step, index) => {
                const Icon = step.icon;
                const isCompleted = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;

                return (
                  <div key={step.status} className="flex flex-col items-center flex-1 relative z-10">
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all ${
                        isCompleted
                          ? isCurrent
                            ? 'bg-primary ring-4 ring-primary/30'
                            : 'bg-primary'
                          : 'bg-primary-foreground/15 border border-primary-foreground/30'
                      }`}
                    >
                      <Icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${
                        isCompleted ? 'text-primary-foreground' : 'text-primary-foreground/50'
                      }`} />
                    </motion.div>
                    <span className={`text-[10px] sm:text-xs mt-1.5 text-center leading-tight ${
                      isCurrent ? 'font-bold text-primary' : isCompleted ? 'text-primary-foreground/80' : 'text-primary-foreground/40'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <CardContent className="p-4 sm:p-6 space-y-5">
        {/* Estimated Delivery Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-3 sm:p-4 rounded-xl bg-muted/50 border border-border"
        >
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Clock className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Estimated Delivery</p>
            <p className="font-semibold text-sm sm:text-base text-foreground truncate">
              {formattedEstimatedDelivery}
            </p>
          </div>
        </motion.div>

        {/* Tracking Timeline */}
        <div>
          <h3 className="font-semibold text-sm sm:text-base mb-4 flex items-center gap-2 text-foreground">
            <Route className="h-4 w-4 text-primary" />
            Tracking History
          </h3>

          {order.tracking?.events && order.tracking.events.length > 0 ? (
            <div className="relative ml-4">
              {/* Vertical timeline line */}
              <div className="absolute left-0 top-2 bottom-2 w-px bg-border" />

              <div className="space-y-0">
                {order.tracking.events.slice().reverse().map((event, index) => {
                  const isFirst = index === 0;

                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="relative pl-6 pb-5 last:pb-0"
                    >
                      {/* Timeline dot */}
                      <div className={`absolute left-0 top-1 w-2.5 h-2.5 rounded-full -translate-x-[4.5px] ring-2 ring-background ${
                        isFirst ? 'bg-primary' : 'bg-muted-foreground/30'
                      }`} />

                      <div className={`${isFirst ? '' : 'opacity-60'}`}>
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <span className={`${isFirst ? 'text-primary' : 'text-muted-foreground'}`}>
                              {getEventIcon(event)}
                            </span>
                            <p className={`text-sm font-medium ${isFirst ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {event.description}
                            </p>
                          </div>
                          {isFirst && (
                            <Badge variant="secondary" className="text-[10px] flex-shrink-0">
                              {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 ml-6">
                          {format(new Date(event.timestamp), "MMM d, h:mm a")}
                        </p>
                        {event.location && (
                          <div className="flex items-center gap-1 mt-1 ml-6">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{event.location}</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <Package className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Tracking information will appear here as your order progresses.</p>
            </div>
          )}
        </div>

        {/* Driver Card */}
        {order.status === "out_for_delivery" && order.tracking?.driver && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-border bg-muted/30 p-4"
          >
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-foreground">
              <User className="h-4 w-4 text-primary" />
              Your Delivery Driver
            </h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-primary/20 flex-shrink-0">
                <img
                  src={order.tracking.driver.photo}
                  alt={order.tracking.driver.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-foreground">{order.tracking.driver.name}</p>
                <a
                  href={`tel:${order.tracking.driver.phone}`}
                  className="text-xs text-primary flex items-center gap-1 hover:underline mt-0.5"
                >
                  <Phone className="h-3 w-3" />
                  {order.tracking.driver.phone}
                </a>
              </div>
            </div>
          </motion.div>
        )}

        {/* Delivery Confirmation */}
        {order.status === "delivered" && order.tracking?.signature && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-chart-3/30 bg-chart-3/5 p-4"
          >
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'hsl(var(--chart-3))' }}>
              <CheckCircle2 className="h-4 w-4" />
              Delivery Confirmed
            </h3>
            <div className="bg-card rounded-lg p-3 border border-border">
              <p className="text-[10px] text-muted-foreground mb-1.5 uppercase tracking-wider">Customer Signature</p>
              <img
                src={order.tracking.signature}
                alt="Customer signature"
                className="max-h-16 object-contain"
              />
            </div>
            {order.tracking.deliveredAt && (
              <p className="text-xs text-muted-foreground mt-2">
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
