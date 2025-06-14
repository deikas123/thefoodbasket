
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ScheduleSelectorProps {
  scheduledDate: Date | undefined;
  setScheduledDate: (date: Date | undefined) => void;
  selectedTimeSlot: string;
  setSelectedTimeSlot: (slot: string) => void;
  getMinScheduledDate: () => Date;
  minDaysAdvance?: number;
}

const ScheduleSelector = ({
  scheduledDate,
  setScheduledDate,
  selectedTimeSlot,
  setSelectedTimeSlot,
  getMinScheduledDate,
  minDaysAdvance
}: ScheduleSelectorProps) => {
  const timeSlots = [
    { id: "morning", label: "9:00 AM - 12:00 PM" },
    { id: "afternoon", label: "12:00 PM - 3:00 PM" },
    { id: "evening", label: "3:00 PM - 6:00 PM" },
  ];

  return (
    <div className="mt-4 space-y-4 border-t pt-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Delivery Date</Label>
          <DatePicker 
            date={scheduledDate} 
            setDate={setScheduledDate}
            disabled={(date) => date < getMinScheduledDate()}
          />
          {minDaysAdvance && minDaysAdvance > 0 && (
            <p className="text-xs text-muted-foreground">
              Minimum {minDaysAdvance} day(s) in advance
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
  );
};

export default ScheduleSelector;
