import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
import PaymentMethods from "@/components/checkout/PaymentMethods";
import OrderSummary from "@/components/checkout/OrderSummary";
import { MpesaPaymentForm } from "../MpesaPaymentForm";
import { PaymentMethod, CartItem } from "@/types";
import { DeliveryOption } from "@/services/deliveryOptionsService";

interface PaymentStepProps {
  selectedPayment: PaymentMethod | null;
  setSelectedPayment: (method: PaymentMethod) => void;
  items: CartItem[];
  total: number;
  selectedDelivery: DeliveryOption | null;
  deliveryAddress?: any;
  onNext: (phoneNumber?: string) => void;
  onPrev: () => void;
  isProcessing: boolean;
}

const PaymentStep = ({
  selectedPayment,
  setSelectedPayment,
  items,
  total,
  selectedDelivery,
  deliveryAddress,
  onNext,
  onPrev,
  isProcessing
}: PaymentStepProps) => {
  const [showMpesaForm, setShowMpesaForm] = useState(false);

  const handlePaymentSelect = (method: PaymentMethod) => {
    setSelectedPayment(method);
    setShowMpesaForm(method.type === 'mpesa' || method.id === 'mpesa');
  };

  const handleMpesaPayment = (phoneNumber: string) => {
    onNext(phoneNumber);
  };

  const handlePlaceOrder = () => {
    if ((selectedPayment?.type === 'mpesa' || selectedPayment?.id === 'mpesa') && !showMpesaForm) {
      setShowMpesaForm(true);
    } else {
      onNext();
    }
  };

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
              setSelectedPayment={handlePaymentSelect}
              orderTotal={total}
            />

            {/* Show M-Pesa form if M-Pesa is selected */}
            {showMpesaForm && (selectedPayment?.type === 'mpesa' || selectedPayment?.id === 'mpesa') && (
              <MpesaPaymentForm
                onSubmit={handleMpesaPayment}
                isProcessing={isProcessing}
              />
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="order-first lg:order-last">
        <OrderSummary 
          items={items}
          subtotal={total}
          selectedDelivery={selectedDelivery}
          deliveryAddress={deliveryAddress}
        >
          <div className="space-y-3">
            {!showMpesaForm && (
              <Button 
                className="w-full" 
                size="lg" 
                onClick={handlePlaceOrder}
                disabled={!selectedPayment || isProcessing}
              >
                {isProcessing ? "Processing..." : (selectedPayment?.type === 'mpesa' || selectedPayment?.id === 'mpesa') ? "Continue to Payment" : "Place Order"}
              </Button>
            )}
            
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={onPrev}
              disabled={isProcessing}
            >
              Back to Delivery
            </Button>
          </div>
        </OrderSummary>
      </div>
    </div>
  );
};

export default PaymentStep;
