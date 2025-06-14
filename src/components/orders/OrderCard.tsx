
import { Order } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Clock, Package, Truck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { formatCurrency } from "@/utils/currencyFormatter";

interface OrderCardProps {
  order: Order;
  onViewOrder: (orderId: string) => void;
}

const OrderCard = ({ order, onViewOrder }: OrderCardProps) => {
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
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="bg-muted/10 py-4">
        <div className="flex flex-wrap justify-between items-center">
          <div>
            <CardTitle className="text-lg md:text-xl flex items-center">
              Order #{order.id}
              <Badge 
                className={`ml-2 capitalize ${getStatusColor(order.status)}`}
              >
                {order.status.replace("_", " ")}
              </Badge>
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Placed {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
            </p>
          </div>
          <Button 
            variant="outline"
            onClick={() => onViewOrder(order.id)}
          >
            View Details
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="flex items-center mb-2 md:mb-0">
              <Clock className="h-5 w-5 text-muted-foreground mr-2" />
              <span className="text-sm">Estimated Delivery: <span className="font-medium">{order.estimatedDelivery}</span></span>
            </div>
            <div className="flex items-center">
              <Package className="h-5 w-5 text-muted-foreground mr-2" />
              <span className="text-sm">Items: <span className="font-medium">{order.items.reduce((sum, item) => sum + item.quantity, 0)}</span></span>
            </div>
          </div>
          
          <Separator />
          
          <div className="flex flex-wrap items-center gap-4">
            {order.items.slice(0, 3).map((item) => (
              <div key={item.productId} className="flex items-center">
                <div className="h-14 w-14 rounded bg-muted/30 overflow-hidden mr-3">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-medium text-sm">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.quantity} × {formatCurrency(item.price)}
                  </p>
                </div>
              </div>
            ))}
            
            {order.items.length > 3 && (
              <div className="text-sm text-muted-foreground">
                +{order.items.length - 3} more items
              </div>
            )}
          </div>
          
          <Separator />
          
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Truck className="h-5 w-5 text-muted-foreground mr-2" />
              <span className="text-sm">{order.deliveryMethod.name}</span>
            </div>
            <div className="font-semibold">
              Total: {formatCurrency(order.total)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderCard;
