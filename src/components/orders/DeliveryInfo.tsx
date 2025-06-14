
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Truck } from "lucide-react";
import { Order } from "@/types";

interface DeliveryInfoProps {
  order: Order;
}

const DeliveryInfo = ({ order }: DeliveryInfoProps) => {
  return (
    <Card className="mt-6">
      <CardHeader className="bg-muted/10 py-4">
        <CardTitle className="text-xl">Delivery Information</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium flex items-center mb-2">
              <Home className="h-4 w-4 mr-2" />
              Delivery Address
            </h3>
            <p className="text-sm">
              {order.deliveryAddress.street} <br />
              {order.deliveryAddress.city}, {order.deliveryAddress.state} <br />
              {order.deliveryAddress.zipCode}
            </p>
          </div>
          
          <div>
            <h3 className="font-medium flex items-center mb-2">
              <Truck className="h-4 w-4 mr-2" />
              Delivery Method
            </h3>
            <p className="text-sm">
              {order.deliveryMethod.name} <br />
              ${order.deliveryMethod.price.toFixed(2)} <br />
              {order.deliveryMethod.estimatedDelivery}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DeliveryInfo;
