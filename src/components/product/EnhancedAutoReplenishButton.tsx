
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Repeat } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useAutoReplenish } from "@/hooks/useAutoReplenish";

interface EnhancedAutoReplenishButtonProps {
  productId: string;
  productName: string;
}

const EnhancedAutoReplenishButton = ({ productId, productName }: EnhancedAutoReplenishButtonProps) => {
  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [scheduleType, setScheduleType] = useState<"frequency" | "custom">("frequency");
  const [frequency, setFrequency] = useState("30");
  const [customTime, setCustomTime] = useState("09:00");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const { addItem, isLoading } = useAutoReplenish();

  const daysOfWeek = [
    { value: "0", label: "Sunday" },
    { value: "1", label: "Monday" },
    { value: "2", label: "Tuesday" },
    { value: "3", label: "Wednesday" },
    { value: "4", label: "Thursday" },
    { value: "5", label: "Friday" },
    { value: "6", label: "Saturday" },
  ];

  const handleDayToggle = (dayValue: string) => {
    setSelectedDays(prev => 
      prev.includes(dayValue) 
        ? prev.filter(d => d !== dayValue)
        : [...prev, dayValue]
    );
  };

  const handleSubmit = async () => {
    const success = await addItem({
      productId,
      quantity: Number(quantity),
      frequencyDays: scheduleType === "frequency" ? Number(frequency) : 7,
      customDays: scheduleType === "custom" ? selectedDays : undefined,
      customTime
    });
    
    if (success) {
      setOpen(false);
      // Reset form
      setQuantity(1);
      setScheduleType("frequency");
      setFrequency("30");
      setCustomTime("09:00");
      setSelectedDays([]);
    }
  };

  return (
    <>
      <Button 
        variant="outline" 
        onClick={() => setOpen(true)}
        className="flex-1"
      >
        <Repeat className="h-4 w-4 mr-2" />
        Auto-Replenish
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Set Up Auto-Replenishment</DialogTitle>
            <DialogDescription>
              Set up automatic delivery for {productName} with custom scheduling.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            {/* Quantity */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right">
                Quantity
              </Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="col-span-3"
              />
            </div>

            {/* Schedule Type */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="schedule-type" className="text-right">
                Schedule
              </Label>
              <Select value={scheduleType} onValueChange={(value: "frequency" | "custom") => setScheduleType(value)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="frequency">Every X days</SelectItem>
                  <SelectItem value="custom">Custom days of week</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Frequency (if frequency type selected) */}
            {scheduleType === "frequency" && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="frequency" className="text-right">
                  Frequency
                </Label>
                <Select value={frequency} onValueChange={setFrequency}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Weekly (7 days)</SelectItem>
                    <SelectItem value="14">Bi-weekly (14 days)</SelectItem>
                    <SelectItem value="30">Monthly (30 days)</SelectItem>
                    <SelectItem value="60">Every 2 months (60 days)</SelectItem>
                    <SelectItem value="90">Every 3 months (90 days)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Custom Days (if custom type selected) */}
            {scheduleType === "custom" && (
              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right mt-2">Days</Label>
                <div className="col-span-3 space-y-2">
                  {daysOfWeek.map((day) => (
                    <div key={day.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`day-${day.value}`}
                        checked={selectedDays.includes(day.value)}
                        onCheckedChange={() => handleDayToggle(day.value)}
                      />
                      <Label htmlFor={`day-${day.value}`}>{day.label}</Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Time */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="time" className="text-right">
                Time
              </Label>
              <Input
                id="time"
                type="time"
                value={customTime}
                onChange={(e) => setCustomTime(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isLoading || (scheduleType === "custom" && selectedDays.length === 0)}
            >
              {isLoading ? "Setting up..." : "Set up auto-replenishment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EnhancedAutoReplenishButton;
