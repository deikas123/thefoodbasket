
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
    return <div>Loading delivery options...</div>;
  }

  if (!deliveryOptions || deliveryOptions.length === 0) {
    return <div>No delivery options available</div>;
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
            className="flex items-start space-x-2 border rounded-lg p-4 transition-colors hover:bg-accent/50"
          >
            <RadioGroupItem value={option.id} id={option.id} className="mt-1" />
            <div className="flex-1">
              <Label 
                htmlFor={option.id}
                className="flex items-start cursor-pointer"
              >
                <div className="flex-1">
                  <div className="flex items-center">
                    {option.is_express ? (
                      <Zap className="h-4 w-4 mr-2 text-amber-500" />
                    ) : (
                      <Truck className="h-4 w-4 mr-2 text-primary" />
                    )}
                    
                    <span className="font-medium">{option.name}</span>
                    
                    {option.is_express && (
                      <Badge className="ml-2 bg-amber-500">Express</Badge>
                    )}
                  </div>
                  
                  <div className="mt-1 text-muted-foreground text-sm">
                    {option.description || `Delivery within ${option.estimated_delivery_days} days`}
                  </div>
                </div>
                
                <div className="text-right font-medium">
                  ${option.base_price.toFixed(2)}
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
