
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Truck, Clock } from "lucide-react";
import DeliveryOptionsNew from "@/components/checkout/DeliveryOptionsNew";
import DeliveryAddressForm from "@/components/checkout/DeliveryAddressForm";
import OrderSummary from "@/components/checkout/OrderSummary";
import { CartItem } from "@/types";
import { DeliveryOption } from "@/services/deliveryOptionsService";
import { toast } from "@/components/ui/use-toast";

interface DeliveryStepProps {
  deliveryAddress: any;
  onAddressChange: (address: any) => void;
  selectedDelivery: DeliveryOption | null;
  setSelectedDelivery: (option: DeliveryOption) => void;
  items: CartItem[];
  total: number;
  onNext: () => void;
  isProcessing: boolean;
}

const DeliveryStep = ({
  deliveryAddress,
  onAddressChange,
  selectedDelivery,
  setSelectedDelivery,
  items,
  total,
  onNext,
  isProcessing
}: DeliveryStepProps) => {
  const handleNext = () => {
    if (!deliveryAddress.street || !deliveryAddress.city) {
      toast({
        title: "Please complete the delivery address",
        description: "You need to provide a complete delivery address to continue.",
        variant: "destructive",
      });
      return;
    }
    onNext();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
      <div className="lg:col-span-2 space-y-6 lg:space-y-8">
        <Card>
          <CardContent className="pt-4 sm:pt-6">
            <h2 className="text-lg sm:text-xl font-semibold flex items-center mb-4">
              <Truck className="mr-2 h-5 w-5 text-primary" />
              Delivery Address
            </h2>
            
            <DeliveryAddressForm 
              address={deliveryAddress}
              onAddressChange={onAddressChange}
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4 sm:pt-6">
            <h2 className="text-lg sm:text-xl font-semibold flex items-center mb-4">
              <Clock className="mr-2 h-5 w-5 text-primary" />
              Delivery Options
            </h2>
            
            <DeliveryOptionsNew 
              selectedDelivery={selectedDelivery}
              setSelectedDelivery={setSelectedDelivery}
            />
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
          <Button 
            className="w-full" 
            size="lg" 
            onClick={handleNext}
            disabled={isProcessing}
          >
            Continue to Payment
          </Button>
        </OrderSummary>
      </div>
    </div>
  );
};

export default DeliveryStep;
