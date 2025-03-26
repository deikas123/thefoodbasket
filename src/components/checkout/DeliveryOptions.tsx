
import { useState } from "react";
import { DeliveryOption } from "@/types";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Truck, Zap, Calendar } from "lucide-react";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { getDeliveryOptions, getDeliveryTimeSlots } from "@/services/deliveryService";

interface DeliveryOptionsProps {
  selectedDelivery: DeliveryOption | null;
  setSelectedDelivery: (option: DeliveryOption) => void;
  postalCode: string;
}

const DeliveryOptions = ({ 
  selectedDelivery, 
  setSelectedDelivery,
  postalCode
}: DeliveryOptionsProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  
  // Get delivery options based on the customer's postal code
  const deliveryOptions = getDeliveryOptions(postalCode);
  
  // Get available time slots for the selected date
  const timeSlots = selectedDate ? getDeliveryTimeSlots(selectedDate) : [];
  
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
      
      {selectedDelivery && selectedDelivery.id !== "same-day" && (
        <div className="mt-6">
          <h3 className="text-sm font-medium mb-2 flex items-center">
            <Calendar className="mr-2 h-4 w-4" />
            Schedule Delivery
          </h3>
          
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full sm:w-auto justify-start text-left font-normal"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => {
                    // Disable dates in the past
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return date < today;
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {timeSlots.map((slot) => (
                <Button
                  key={slot.id}
                  variant={selectedTimeSlot === slot.id ? "default" : "outline"}
                  onClick={() => setSelectedTimeSlot(slot.id)}
                  className="text-xs"
                >
                  {slot.time}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryOptions;
