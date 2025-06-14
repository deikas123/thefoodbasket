
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Order } from "@/types";

interface OrderItemsListProps {
  order: Order;
}

const OrderItemsList = ({ order }: OrderItemsListProps) => {
  return (
    <Card>
      <CardHeader className="bg-muted/10 py-4">
        <CardTitle className="text-xl">Order Items</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {order.items.map((item) => (
            <div key={item.productId} className="flex p-4">
              <div className="h-16 w-16 rounded bg-muted/30 overflow-hidden mr-4">
                <img 
                  src={item.image} 
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-grow">
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-muted-foreground">
                  Quantity: {item.quantity}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">
                  ${item.price.toFixed(2)} each
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderItemsList;
