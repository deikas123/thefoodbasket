
import { useState, useEffect } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Truck, Zap, Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getActiveDeliveryOptions, DeliveryOption } from "@/services/deliveryOptionsService";
import { formatCurrency } from "@/utils/currencyFormatter";
import { DatePicker } from "@/components/ui/date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

interface DeliveryOptionsNewProps {
  selectedDelivery: DeliveryOption | null;
  setSelectedDelivery: (option: DeliveryOption) => void;
  onScheduleChange?: (schedule: { date: Date | undefined; timeSlot: string }) => void;
  subtotal?: number;
}

const DeliveryOptionsNew = ({ 
  selectedDelivery, 
  setSelectedDelivery,
  onScheduleChange,
  subtotal = 0
}: DeliveryOptionsNewProps) => {
  const [selectedValue, setSelectedValue] = useState<string>("");
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>();
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("");
  
  const { data: deliveryOptions, isLoading } = useQuery({
    queryKey: ["delivery-options"],
    queryFn: getActiveDeliveryOptions
  });

  const { data: deliverySettings } = useQuery({
    queryKey: ["delivery-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('website_sections')
        .select('settings')
        .eq('type', 'delivery_settings')
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data?.settings || {
        scheduled_delivery: {
          pricing_type: 'free',
          min_days_advance: 1
        }
      };
    }
  });

  // Time slots for scheduled delivery
  const timeSlots = [
    { id: "morning", label: "9:00 AM - 12:00 PM" },
    { id: "afternoon", label: "12:00 PM - 3:00 PM" },
    { id: "evening", label: "3:00 PM - 6:00 PM" },
  ];

  // Calculate scheduled delivery price
  const calculateScheduledPrice = () => {
    if (!deliverySettings?.scheduled_delivery) return 0;
    
    const { pricing_type, fixed_price, percentage_of_subtotal } = deliverySettings.scheduled_delivery;
    
    switch (pricing_type) {
      case 'free':
        return 0;
      case 'fixed':
        return fixed_price || 0;
      case 'percentage':
        return subtotal * ((percentage_of_subtotal || 0) / 100);
      default:
        return 0;
    }
  };

  // Get minimum date for scheduled delivery
  const getMinScheduledDate = () => {
    const minDays = deliverySettings?.scheduled_delivery?.min_days_advance || 1;
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + minDays);
    return minDate;
  };

  // Auto-select first option if none selected
  useEffect(() => {
    if (deliveryOptions && deliveryOptions.length > 0 && !selectedDelivery) {
      setSelectedDelivery(deliveryOptions[0]);
      setSelectedValue(deliveryOptions[0].id);
    }
  }, [deliveryOptions, selectedDelivery, setSelectedDelivery]);

  // Update selected value when selectedDelivery changes
  useEffect(() => {
    if (selectedDelivery) {
      setSelectedValue(selectedDelivery.id);
    }
  }, [selectedDelivery]);

  // Notify parent of schedule changes
  useEffect(() => {
    if (onScheduleChange) {
      onScheduleChange({ date: scheduledDate, timeSlot: selectedTimeSlot });
    }
  }, [scheduledDate, selectedTimeSlot, onScheduleChange]);

  const handleDeliveryChange = (value: string) => {
    setSelectedValue(value);
    
    if (value === "scheduled") {
      // Create a virtual scheduled delivery option with calculated price
      const scheduledPrice = calculateScheduledPrice();
      const scheduledOption: DeliveryOption = {
        id: "scheduled",
        name: "Scheduled Delivery",
        description: "Choose your preferred date and time",
        base_price: scheduledPrice,
        estimated_delivery_days: 0,
        is_express: false,
        active: true
      };
      setSelectedDelivery(scheduledOption);
    } else {
      const option = deliveryOptions?.find(opt => opt.id === value);
      if (option) {
        setSelectedDelivery(option);
      }
    }
  };

  if (isLoading) {
    return <div className="p-4 text-center">Loading delivery options...</div>;
  }

  if (!deliveryOptions || deliveryOptions.length === 0) {
    return <div className="p-4 text-center text-muted-foreground">No delivery options available</div>;
  }

  const scheduledPrice = calculateScheduledPrice();
  
  return (
    <div>
      <RadioGroup 
        value={selectedValue} 
        onValueChange={handleDeliveryChange}
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
        ))}

        {/* Scheduled Delivery Option */}
        <div className="flex items-start space-x-3 border rounded-lg p-3 sm:p-4 transition-colors hover:bg-accent/50">
          <RadioGroupItem value="scheduled" id="scheduled" className="mt-1 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <Label 
              htmlFor="scheduled"
              className="flex flex-col sm:flex-row sm:items-start cursor-pointer gap-2"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center flex-wrap gap-2">
                  <Calendar className="h-4 w-4 text-blue-500 flex-shrink-0" />
                  <span className="font-medium text-sm sm:text-base">Scheduled Delivery</span>
                  <Badge variant="outline" className="text-xs">Custom</Badge>
                </div>
                
                <div className="mt-1 text-muted-foreground text-xs sm:text-sm">
                  Choose your preferred date and time
                </div>
              </div>
              
              <div className="text-left sm:text-right font-medium flex-shrink-0">
                <div className="text-sm sm:text-base">
                  {scheduledPrice === 0 ? "Free" : formatCurrency(scheduledPrice)}
                </div>
                {deliverySettings?.scheduled_delivery?.pricing_type === 'percentage' && (
                  <div className="text-xs text-muted-foreground">
                    {deliverySettings.scheduled_delivery.percentage_of_subtotal}% of subtotal
                  </div>
                )}
              </div>
            </Label>

            {/* Schedule Selection - only show when scheduled delivery is selected */}
            {selectedValue === "scheduled" && (
              <div className="mt-4 space-y-4 border-t pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Delivery Date</Label>
                    <DatePicker 
                      date={scheduledDate} 
                      setDate={setScheduledDate}
                      disabled={(date) => date < getMinScheduledDate()}
                    />
                    {deliverySettings?.scheduled_delivery?.min_days_advance && deliverySettings.scheduled_delivery.min_days_advance > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Minimum {deliverySettings.scheduled_delivery.min_days_advance} day(s) in advance
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Time Slot</Label>
                    <Select value={selectedTimeSlot} onValueChange={setSelectedTimeSlot}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select time slot" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((slot) => (
                          <SelectItem key={slot.id} value={slot.id}>
                            {slot.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </RadioGroup>
    </div>
  );
};

export default DeliveryOptionsNew;
