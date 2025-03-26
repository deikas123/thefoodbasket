
import { CartItem } from "@/types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShoppingBag } from "lucide-react";

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
  const total = subtotal + deliveryFee - discount;
  const itemCount = items.reduce((count, item) => count + item.quantity, 0);
  
  return (
    <Card>
      <CardContent className="pt-6">
        <h2 className="text-xl font-semibold flex items-center mb-4">
          <ShoppingBag className="mr-2 h-5 w-5 text-primary" />
          Order Summary
        </h2>
        
        <div className="mt-4 space-y-4">
          <div>
            <h3 className="font-medium mb-2 flex items-center justify-between">
              <span>Items ({itemCount})</span>
              <Badge variant="outline">{items.length} products</Badge>
            </h3>
            
            <div className="space-y-2 max-h-64 overflow-auto pr-2">
              {items.map((item) => (
                <div key={item.product.id} className="flex justify-between text-sm">
                  <div className="flex-1">
                    <span>{item.product.name}</span>
                    <span className="text-muted-foreground ml-1">× {item.quantity}</span>
                  </div>
                  <div className="font-medium">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-muted-foreground">Delivery Fee</span>
              <span>${deliveryFee.toFixed(2)}</span>
            </div>
            
            {discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-${discount.toFixed(2)}</span>
              </div>
            )}
          </div>
          
          <Separator />
          
          <div className="flex justify-between font-medium text-lg">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderSummary;
