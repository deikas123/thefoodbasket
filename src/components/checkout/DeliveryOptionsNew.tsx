
import { useState, useEffect } from "react";
import { RadioGroup } from "@/components/ui/radio-group";
import { useQuery } from "@tanstack/react-query";
import { getActiveDeliveryOptions, DeliveryOption } from "@/services/deliveryOptionsService";
import { supabase } from "@/integrations/supabase/client";
import DeliveryOptionCard from "./delivery/DeliveryOptionCard";
import ScheduledDeliveryCard from "./delivery/ScheduledDeliveryCard";

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
          <DeliveryOptionCard key={option.id} option={option} />
        ))}

        <ScheduledDeliveryCard
          selectedValue={selectedValue}
          scheduledPrice={scheduledPrice}
          scheduledDate={scheduledDate}
          setScheduledDate={setScheduledDate}
          selectedTimeSlot={selectedTimeSlot}
          setSelectedTimeSlot={setSelectedTimeSlot}
          getMinScheduledDate={getMinScheduledDate}
          deliverySettings={deliverySettings}
        />
      </RadioGroup>
    </div>
  );
};

export default DeliveryOptionsNew;
