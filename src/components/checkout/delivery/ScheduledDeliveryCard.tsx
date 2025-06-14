
import { RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import { formatCurrency } from "@/utils/currencyFormatter";
import ScheduleSelector from "./ScheduleSelector";

interface ScheduledDeliveryCardProps {
  selectedValue: string;
  scheduledPrice: number;
  scheduledDate: Date | undefined;
  setScheduledDate: (date: Date | undefined) => void;
  selectedTimeSlot: string;
  setSelectedTimeSlot: (slot: string) => void;
  getMinScheduledDate: () => Date;
  deliverySettings?: any;
}

const ScheduledDeliveryCard = ({
  selectedValue,
  scheduledPrice,
  scheduledDate,
  setScheduledDate,
  selectedTimeSlot,
  setSelectedTimeSlot,
  getMinScheduledDate,
  deliverySettings
}: ScheduledDeliveryCardProps) => {
  return (
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
          <ScheduleSelector
            scheduledDate={scheduledDate}
            setScheduledDate={setScheduledDate}
            selectedTimeSlot={selectedTimeSlot}
            setSelectedTimeSlot={setSelectedTimeSlot}
            getMinScheduledDate={getMinScheduledDate}
            minDaysAdvance={deliverySettings?.scheduled_delivery?.min_days_advance}
          />
        )}
      </div>
    </div>
  );
};

export default ScheduledDeliveryCard;
