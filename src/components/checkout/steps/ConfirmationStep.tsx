
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Truck } from "lucide-react";
import { Order } from "@/types";

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
