
import { DeliveryOption } from "@/types";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Truck, Zap } from "lucide-react";

interface DeliveryOptionsProps {
  selectedDelivery: DeliveryOption | null;
  setSelectedDelivery: (option: DeliveryOption) => void;
}

// Mock delivery options
const deliveryOptions: DeliveryOption[] = [
  {
    id: "standard",
    name: "Standard Delivery",
    description: "Delivery within 2-3 business days",
    price: 5.99,
    estimatedDelivery: "2-3 business days",
    speed: "standard"
  },
  {
    id: "express",
    name: "Express Delivery",
    description: "Delivery within 24 hours",
    price: 12.99,
    estimatedDelivery: "24 hours",
    speed: "express"
  },
  {
    id: "same-day",
    name: "Same-Day Delivery",
    description: "Delivery today (order before 2PM)",
    price: 19.99,
    estimatedDelivery: "Today",
    speed: "express"
  }
];

const DeliveryOptions = ({ 
  selectedDelivery, 
  setSelectedDelivery 
}: DeliveryOptionsProps) => {
  
  return (
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
                  {option.speed === "express" ? (
                    <Zap className="h-4 w-4 mr-2 text-amber-500" />
                  ) : (
                    <Truck className="h-4 w-4 mr-2 text-primary" />
                  )}
                  
                  <span className="font-medium">{option.name}</span>
                  
                  {option.speed === "express" && (
                    <Badge className="ml-2 bg-amber-500">Fast</Badge>
                  )}
                </div>
                
                <div className="mt-1 text-muted-foreground text-sm">
                  {option.description}
                </div>
              </div>
              
              <div className="text-right font-medium">
                ${option.price.toFixed(2)}
              </div>
            </Label>
          </div>
        </div>
      ))}
    </RadioGroup>
  );
};

export default DeliveryOptions;
