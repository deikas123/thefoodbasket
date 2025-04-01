
import { CartItem } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface OrderSummaryProps {
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  discount?: number;
}

const OrderSummary = ({ 
  items, 
  subtotal, 
  deliveryFee,
  discount = 0
}: OrderSummaryProps) => {
  // Calculate total
  const total = subtotal + deliveryFee - discount;
  
  return (
    <Card className="sticky top-24">
      <CardHeader className="bg-muted/10 py-4">
        <CardTitle className="flex items-center">
          <ShoppingCart className="mr-2 h-5 w-5" />
          Order Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-2">
            {items.length} item{items.length !== 1 && 's'} in cart
          </p>
          
          <div className="max-h-40 overflow-auto space-y-2">
            {items.map(item => (
              <div key={item.product.id} className="flex justify-between text-sm">
                <div className="flex items-center">
                  <span className="font-medium">{item.quantity} x</span>
                  <span className="ml-2 truncate max-w-[180px]">{item.product.name}</span>
                </div>
                <span>${(item.product.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
        
        <Separator className="my-4" />
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">Delivery</span>
            <span>${deliveryFee.toFixed(2)}</span>
          </div>
          
          {discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount</span>
              <span>-${discount.toFixed(2)}</span>
            </div>
          )}
        </div>
        
        <Separator className="my-4" />
        
        <div className="flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderSummary;
