
import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import { ScheduleTypeSelector } from "./ScheduleTypeSelector";
import { CustomDaysSelector } from "./CustomDaysSelector";
import { useAutoReplenish } from "@/hooks/useAutoReplenish";

interface AutoReplenishDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  productName: string;
}

export const AutoReplenishDialog = ({ 
  open, 
  onOpenChange, 
  productId, 
  productName 
}: AutoReplenishDialogProps) => {
  const [quantity, setQuantity] = useState(1);
  const [scheduleType, setScheduleType] = useState<"frequency" | "custom">("frequency");
  const [frequency, setFrequency] = useState("30");
  const [customTime, setCustomTime] = useState("09:00");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const { addItem, isLoading } = useAutoReplenish();

  const handleSubmit = async () => {
    const success = await addItem({
      productId,
      quantity: Number(quantity),
      frequencyDays: scheduleType === "frequency" ? Number(frequency) : 7,
      customDays: scheduleType === "custom" ? selectedDays : undefined,
      customTime
    });
    
    if (success) {
      onOpenChange(false);
      // Reset form
      setQuantity(1);
      setScheduleType("frequency");
      setFrequency("30");
      setCustomTime("09:00");
      setSelectedDays([]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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

          <ScheduleTypeSelector
            scheduleType={scheduleType}
            onScheduleTypeChange={setScheduleType}
            frequency={frequency}
            onFrequencyChange={setFrequency}
          />

          {scheduleType === "custom" && (
            <CustomDaysSelector
              selectedDays={selectedDays}
              onDaysChange={setSelectedDays}
            />
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
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
  );
};
