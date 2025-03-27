
import { useState } from "react";
import { CartItem } from "@/types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShoppingBag, CreditCard } from "lucide-react";
import PromoCodeInput from "./PromoCodeInput";
import { formatCurrency } from "@/utils/currencyFormatter";

interface OrderSummaryProps {
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  loyaltyPointsAvailable?: number;
  onUseLoyaltyPoints?: (usePoints: boolean) => void;
}

const OrderSummary = ({ 
  items, 
  subtotal, 
  deliveryFee, 
  loyaltyPointsAvailable = 0,
  onUseLoyaltyPoints
}: OrderSummaryProps) => {
  const [discount, setDiscount] = useState(0);
  const [useLoyaltyPoints, setUseLoyaltyPoints] = useState(false);
  
  // Calculate loyalty points discount (1 point = KSh 10)
  const loyaltyDiscount = useLoyaltyPoints ? Math.min(loyaltyPointsAvailable * 10, subtotal * 0.2) : 0;
  
  // Calculate final price
  const total = Math.max(0, subtotal + deliveryFee - discount - loyaltyDiscount);
  const itemCount = items.reduce((count, item) => count + item.quantity, 0);
  
  const handleApplyPromo = (discountAmount: number) => {
    if (discountAmount > 0) {
      // If percentage discount
      const calculatedDiscount = (subtotal * discountAmount) / 100;
      // Cap the discount at 90% of the subtotal
      setDiscount(Math.min(calculatedDiscount, subtotal * 0.9));
    } else {
      setDiscount(0);
    }
  };
  
  const handleToggleLoyaltyPoints = () => {
    const newValue = !useLoyaltyPoints;
    setUseLoyaltyPoints(newValue);
    if (onUseLoyaltyPoints) {
      onUseLoyaltyPoints(newValue);
    }
  };
  
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
            
            <div className="space-y-2 max-h-52 overflow-auto pr-2">
              {items.map((item) => (
                <div key={item.product.id} className="flex justify-between text-sm">
                  <div className="flex-1">
                    <span>{item.product.name}</span>
                    <span className="text-muted-foreground ml-1">× {item.quantity}</span>
                  </div>
                  <div className="font-medium">
                    {formatCurrency(item.product.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-muted-foreground">Delivery Fee</span>
              <span>{formatCurrency(deliveryFee)}</span>
            </div>
            
            {discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Promo Discount</span>
                <span>-{formatCurrency(discount)}</span>
              </div>
            )}
            
            {loyaltyDiscount > 0 && (
              <div className="flex justify-between text-purple-600">
                <span>Loyalty Points</span>
                <span>-{formatCurrency(loyaltyDiscount)}</span>
              </div>
            )}
          </div>
          
          <Separator />
          
          <div className="flex justify-between font-medium text-lg">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
          
          <Separator />
          
          <PromoCodeInput onApplyPromo={handleApplyPromo} />
          
          {loyaltyPointsAvailable > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CreditCard className="h-4 w-4 mr-2 text-primary" />
                  <span className="text-sm font-medium">Use Loyalty Points</span>
                </div>
                <div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={useLoyaltyPoints}
                      onChange={handleToggleLoyaltyPoints}
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {useLoyaltyPoints 
                  ? `Using ${Math.ceil(loyaltyDiscount / 10)} points to save ${formatCurrency(loyaltyDiscount)}`
                  : `You have ${loyaltyPointsAvailable} points available (worth up to ${formatCurrency(loyaltyPointsAvailable * 10)})`
                }
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderSummary;
