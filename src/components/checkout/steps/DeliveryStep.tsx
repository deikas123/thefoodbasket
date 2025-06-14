
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Truck, Clock } from "lucide-react";
import DeliveryOptionsNew from "@/components/checkout/DeliveryOptionsNew";
import DeliveryAddressForm from "@/components/checkout/DeliveryAddressForm";
import OrderSummary from "@/components/checkout/OrderSummary";
import { CartItem } from "@/types";
import { DeliveryOption } from "@/services/deliveryOptionsService";
import { toast } from "@/components/ui/use-toast";
import { useState } from "react";

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
  const [scheduleData, setScheduleData] = useState<{ date: Date | undefined; timeSlot: string }>({
    date: undefined,
    timeSlot: ""
  });

  const handleNext = () => {
    if (!deliveryAddress.street || !deliveryAddress.city) {
      toast({
        title: "Please complete the delivery address",
        description: "You need to provide a complete delivery address to continue.",
        variant: "destructive",
      });
      return;
    }

    // Check if scheduled delivery is selected and validate schedule
    if (selectedDelivery?.id === "scheduled") {
      if (!scheduleData.date || !scheduleData.timeSlot) {
        toast({
          title: "Please complete the delivery schedule",
          description: "You need to select both a date and time slot for scheduled delivery.",
          variant: "destructive",
        });
        return;
      }

      // Check if the selected date is in the future
      const selectedDate = new Date(scheduleData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        toast({
          title: "Invalid delivery date",
          description: "Please select a future date for delivery.",
          variant: "destructive",
        });
        return;
      }
    }

    onNext();
  };

  const handleScheduleChange = (schedule: { date: Date | undefined; timeSlot: string }) => {
    setScheduleData(schedule);
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
              onScheduleChange={handleScheduleChange}
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
          onNext={handleNext}
          isProcessing={isProcessing}
          buttonText="Continue to Payment"
        />
      </div>
    </div>
  );
};

export default DeliveryStep;
