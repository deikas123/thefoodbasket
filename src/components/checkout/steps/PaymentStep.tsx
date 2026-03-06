import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, ArrowLeft, ShieldCheck } from "lucide-react";
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

  const isMpesa = selectedPayment?.type === 'mpesa' || selectedPayment?.id === 'mpesa';

  return (
    <div className="space-y-4 lg:grid lg:grid-cols-3 lg:gap-8 lg:space-y-0">
      {/* Order Summary - shown first on mobile, last on desktop */}
      <div className="order-first lg:order-last">
        <OrderSummary 
          items={items}
          subtotal={total}
          selectedDelivery={selectedDelivery}
          deliveryAddress={deliveryAddress}
        />
      </div>

      {/* Payment Methods */}
      <div className="lg:col-span-2 space-y-4">
        <Card className="border-0 shadow-sm sm:border sm:shadow">
          <CardContent className="p-4 sm:pt-6">
            <h2 className="text-base sm:text-xl font-semibold flex items-center mb-4">
              <CreditCard className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              Select Payment Method
            </h2>
            
            <PaymentMethods
              selectedPayment={selectedPayment}
              setSelectedPayment={handlePaymentSelect}
              orderTotal={total}
            />

            {/* M-Pesa form inline */}
            {showMpesaForm && isMpesa && (
              <div className="mt-4 p-4 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
                <MpesaPaymentForm
                  onSubmit={handleMpesaPayment}
                  isProcessing={isProcessing}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security badge - mobile */}
        <div className="flex items-center text-xs sm:text-sm text-muted-foreground p-3 rounded-lg bg-muted/50">
          <ShieldCheck className="h-4 w-4 mr-2 text-primary shrink-0" />
          <p>All payments are encrypted and securely processed</p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-3 sm:flex-row-reverse sm:gap-4">
          {!showMpesaForm && (
            <Button 
              className="w-full sm:flex-1" 
              size="lg" 
              onClick={handlePlaceOrder}
              disabled={!selectedPayment || isProcessing}
            >
              {isProcessing 
                ? "Processing..." 
                : isMpesa 
                  ? "Continue to M-Pesa" 
                  : "Place Order"
              }
            </Button>
          )}
          
          <Button 
            variant="outline" 
            className="w-full sm:w-auto" 
            onClick={onPrev}
            disabled={isProcessing}
            size="lg"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentStep;
