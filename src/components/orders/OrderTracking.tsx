
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Package, MapPin, Phone } from "lucide-react";
import { format } from "date-fns";
import { Order } from "@/types";

interface OrderTrackingProps {
  order: Order;
}

const OrderTracking = ({ order }: OrderTrackingProps) => {
  // Helper function to get status badge color
  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pending": return "bg-yellow-500 hover:bg-yellow-600";
      case "processing": return "bg-blue-500 hover:bg-blue-600";
      case "dispatched": return "bg-purple-500 hover:bg-purple-600";
      case "out_for_delivery": return "bg-indigo-500 hover:bg-indigo-600";
      case "delivered": return "bg-green-500 hover:bg-green-600";
      case "cancelled": return "bg-red-500 hover:bg-red-600";
      default: return "bg-gray-500 hover:bg-gray-600";
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader className="bg-muted/10 py-4">
        <CardTitle className="text-xl">Order Tracking</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex items-center mb-6">
          <Clock className="h-5 w-5 text-muted-foreground mr-2" />
          <span className="text-sm">
            Estimated Delivery: <span className="font-medium">{order.estimatedDelivery}</span>
          </span>
        </div>
        
        {/* Tracking timeline */}
        <div className="relative">
          {order.tracking?.events?.map((event, index) => {
            const isLast = index === order.tracking!.events.length - 1;
            
            return (
              <div key={index} className="flex mb-6 last:mb-0">
                {/* Status line */}
                {!isLast && (
                  <div className="absolute top-5 left-4 w-0.5 h-full bg-muted -z-10"></div>
                )}
                
                {/* Status circle */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 flex-shrink-0 ${
                  getStatusColor(event.status)
                }`}>
                  <Package className="h-4 w-4 text-white" />
                </div>
                
                {/* Status details */}
                <div>
                  <p className="font-medium">{event.description}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(event.timestamp), "PPP 'at' p")}
                  </p>
                  {event.location && (
                    <p className="text-sm mt-1 flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {event.location}
                    </p>
                  )}
                </div>
              </div>
            );
          }) || (
            <p className="text-muted-foreground">No tracking information available yet.</p>
          )}
        </div>
        
        {/* Driver information for out-for-delivery orders */}
        {(order.status === "out_for_delivery" && order.tracking?.driver) && (
          <div className="mt-6 p-4 border rounded-md bg-muted/10">
            <h3 className="font-medium mb-3">Delivery Driver</h3>
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                <img 
                  src={order.tracking.driver.photo} 
                  alt={order.tracking.driver.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="font-medium">{order.tracking.driver.name}</p>
                <p className="text-sm flex items-center">
                  <Phone className="h-3 w-3 mr-1" />
                  {order.tracking.driver.phone}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderTracking;
