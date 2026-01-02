import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Truck, Receipt } from "lucide-react";
import { Order } from "@/types";
import { formatCurrency } from "@/utils/currencyFormatter";
import confetti from "canvas-confetti";

interface ConfirmationStepProps {
  completedOrder: Order;
  onTrackOrder: (orderId: string) => void;
  onContinueShopping: () => void;
}

const ConfirmationStep = ({
  completedOrder,
  onTrackOrder,
  onContinueShopping
}: ConfirmationStepProps) => {
  useEffect(() => {
    // Trigger confetti on mount
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6']
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, []);

  return (
    <div className="max-w-2xl mx-auto text-center">
      <div className="mb-8">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
        </div>
        
        <h2 className="text-xl sm:text-2xl font-bold mb-2">Order Confirmed!</h2>
        <p className="text-sm sm:text-base text-muted-foreground mb-6 px-4">
          Your order #{completedOrder.id} has been placed and is being processed. You will receive a confirmation email shortly.
        </p>
        
        <div className="p-4 sm:p-6 border rounded-md mb-6 sm:mb-8 text-left">
          <div className="mb-4">
            <h3 className="font-medium mb-2 text-sm sm:text-base">Delivery Address:</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {completedOrder.deliveryAddress.street}, {completedOrder.deliveryAddress.city}<br />
              {completedOrder.deliveryAddress.state}, {completedOrder.deliveryAddress.zipCode}
            </p>
          </div>
          
          <Separator className="my-4" />
          
          <div className="mb-4">
            <h3 className="font-medium mb-2 text-sm sm:text-base">Delivery Method:</h3>
            <p className="text-xs sm:text-sm">{completedOrder.deliveryMethod.name}</p>
            <p className="text-xs text-muted-foreground">
              Estimated delivery: {completedOrder.estimatedDelivery}
            </p>
          </div>
          
          <Separator className="my-4" />
          
          <div>
            <h3 className="font-medium mb-2 text-sm sm:text-base">Payment Method:</h3>
            <p className="text-xs sm:text-sm">{completedOrder.paymentMethod.name}</p>
          </div>
          
          <Separator className="my-4" />
          
          {/* Receipt Summary */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Receipt className="h-4 w-4 text-primary" />
              <h3 className="font-medium text-sm sm:text-base">Order Receipt</h3>
            </div>
            
            <div className="space-y-2 text-xs sm:text-sm">
              {completedOrder.items.map((item, index) => (
                <div key={index} className="flex justify-between">
                  <span className="text-muted-foreground">
                    {item.quantity}x {item.name}
                  </span>
                  <span>{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
              
              <Separator className="my-2" />
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(completedOrder.subtotal)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery Fee</span>
                <span>{formatCurrency(completedOrder.deliveryFee)}</span>
              </div>
              
              {completedOrder.discount && completedOrder.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-{formatCurrency(completedOrder.discount)}</span>
                </div>
              )}
              
              <Separator className="my-2" />
              
              <div className="flex justify-between font-bold text-base">
                <span>Total</span>
                <span>{formatCurrency(completedOrder.total)}</span>
              </div>
              
              {completedOrder.loyaltyPointsEarned && completedOrder.loyaltyPointsEarned > 0 && (
                <div className="flex justify-between text-primary text-xs mt-2">
                  <span>Points Earned</span>
                  <span>+{completedOrder.loyaltyPointsEarned} points</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
          <Button 
            onClick={() => onTrackOrder(completedOrder.id)}
            className="w-full sm:w-auto"
          >
            <Truck className="mr-2 h-4 w-4" />
            Track Order
          </Button>
          
          <Button 
            variant="outline" 
            onClick={onContinueShopping}
            className="w-full sm:w-auto"
          >
            Continue Shopping
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationStep;
