
import { useState, useEffect } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Truck, Zap } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getActiveDeliveryOptions, DeliveryOption } from "@/services/deliveryOptionsService";

interface DeliveryOptionsNewProps {
  selectedDelivery: DeliveryOption | null;
  setSelectedDelivery: (option: DeliveryOption) => void;
}

const DeliveryOptionsNew = ({ 
  selectedDelivery, 
  setSelectedDelivery
}: DeliveryOptionsNewProps) => {
  const { data: deliveryOptions, isLoading } = useQuery({
    queryKey: ["delivery-options"],
    queryFn: getActiveDeliveryOptions
  });

  // Auto-select first option if none selected
  useEffect(() => {
    if (deliveryOptions && deliveryOptions.length > 0 && !selectedDelivery) {
      setSelectedDelivery(deliveryOptions[0]);
    }
  }, [deliveryOptions, selectedDelivery, setSelectedDelivery]);

  if (isLoading) {
    return <div className="p-4 text-center">Loading delivery options...</div>;
  }

  if (!deliveryOptions || deliveryOptions.length === 0) {
    return <div className="p-4 text-center text-muted-foreground">No delivery options available</div>;
  }
  
  return (
    <div>
      <RadioGroup 
        value={selectedDelivery?.id} 
        onValueChange={(value) => {
          const option = deliveryOptions.find(opt => opt.id === value);
          if (option) setSelectedDelivery(option);
        }}
        className="space-y-3"
      >
        {deliveryOptions.map((option) => (
          <div
            key={option.id}
            className="flex items-start space-x-3 border rounded-lg p-3 sm:p-4 transition-colors hover:bg-accent/50"
          >
            <RadioGroupItem value={option.id} id={option.id} className="mt-1 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <Label 
                htmlFor={option.id}
                className="flex flex-col sm:flex-row sm:items-start cursor-pointer gap-2"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center flex-wrap gap-2">
                    {option.is_express ? (
                      <Zap className="h-4 w-4 text-amber-500 flex-shrink-0" />
                    ) : (
                      <Truck className="h-4 w-4 text-primary flex-shrink-0" />
                    )}
                    
                    <span className="font-medium text-sm sm:text-base">{option.name}</span>
                    
                    {option.is_express && (
                      <Badge className="bg-amber-500 text-xs">Express</Badge>
                    )}
                  </div>
                  
                  <div className="mt-1 text-muted-foreground text-xs sm:text-sm">
                    {option.description || `Delivery within ${option.estimated_delivery_days} days`}
                  </div>
                </div>
                
                <div className="text-left sm:text-right font-medium flex-shrink-0">
                  <div className="text-sm sm:text-base">
                    ${option.base_price.toFixed(2)}
                  </div>
                  {option.price_per_km && (
                    <div className="text-xs text-muted-foreground">
                      + ${option.price_per_km}/km
                    </div>
                  )}
                </div>
              </Label>
            </div>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
};

export default DeliveryOptionsNew;
