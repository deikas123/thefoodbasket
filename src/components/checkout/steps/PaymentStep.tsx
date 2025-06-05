
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
import PaymentMethods from "@/components/checkout/PaymentMethods";
import OrderSummary from "@/components/checkout/OrderSummary";
import { PaymentMethod, CartItem } from "@/types";
import { DeliveryOption } from "@/services/deliveryOptionsService";

interface PaymentStepProps {
  selectedPayment: PaymentMethod | null;
  setSelectedPayment: (method: PaymentMethod) => void;
  items: CartItem[];
  total: number;
  selectedDelivery: DeliveryOption | null;
  onNext: () => void;
  onPrev: () => void;
  isProcessing: boolean;
}

const PaymentStep = ({
  selectedPayment,
  setSelectedPayment,
  items,
  total,
  selectedDelivery,
  onNext,
  onPrev,
  isProcessing
}: PaymentStepProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
      <div className="lg:col-span-2">
        <Card>
          <CardContent className="pt-4 sm:pt-6">
            <h2 className="text-lg sm:text-xl font-semibold flex items-center mb-4">
              <CreditCard className="mr-2 h-5 w-5 text-primary" />
              Payment Method
            </h2>
            
            <PaymentMethods 
              selectedPayment={selectedPayment}
              setSelectedPayment={setSelectedPayment}
              orderTotal={total}
            />
          </CardContent>
        </Card>
      </div>
      
      <div className="order-first lg:order-last">
        <OrderSummary 
          items={items}
          subtotal={total}
          deliveryFee={selectedDelivery?.base_price || 0}
        />
        
        <div className="mt-4 space-y-3">
          <Button 
            className="w-full" 
            size="lg" 
            onClick={onNext}
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : "Place Order"}
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={onPrev}
            disabled={isProcessing}
          >
            Back to Delivery
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentStep;
