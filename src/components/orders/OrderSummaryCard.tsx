
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CreditCard, RefreshCcw } from "lucide-react";
import { formatCurrency } from "@/utils/currencyFormatter";
import { Order } from "@/types";

interface OrderSummaryCardProps {
  order: Order;
}

const OrderSummaryCard = ({ order }: OrderSummaryCardProps) => {
  return (
    <Card className="sticky top-24">
      <CardHeader className="bg-muted/10 py-4">
        <CardTitle className="text-xl">Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatCurrency(order.subtotal)}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">Delivery</span>
            <span>{formatCurrency(order.deliveryFee)}</span>
          </div>
          
          <Separator />
          
          <div className="flex justify-between font-medium">
            <span>Total</span>
            <span>{formatCurrency(order.total)}</span>
          </div>
          
          <div className="flex items-center pt-2">
            <CreditCard className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="text-sm">
              Paid with {order.paymentMethod.name}
            </span>
          </div>
          
          {order.status === "delivered" && (
            <Button className="w-full mt-2">
              <RefreshCcw className="mr-2 h-4 w-4" />
              Buy Again
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderSummaryCard;
