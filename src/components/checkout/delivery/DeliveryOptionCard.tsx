
import { RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Truck, Zap } from "lucide-react";
import { DeliveryOption } from "@/services/deliveryOptionsService";
import { formatCurrency } from "@/utils/currencyFormatter";

interface DeliveryOptionCardProps {
  option: DeliveryOption;
}

const DeliveryOptionCard = ({ option }: DeliveryOptionCardProps) => {
  return (
    <div className="flex items-start space-x-3 border rounded-lg p-3 sm:p-4 transition-colors hover:bg-accent/50">
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
              {formatCurrency(option.base_price)}
            </div>
            {option.price_per_km && (
              <div className="text-xs text-muted-foreground">
                + {formatCurrency(option.price_per_km)}/km
              </div>
            )}
          </div>
        </Label>
      </div>
    </div>
  );
};

export default DeliveryOptionCard;
