
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ScheduleTypeSelectorProps {
  scheduleType: "frequency" | "custom";
  onScheduleTypeChange: (type: "frequency" | "custom") => void;
  frequency: string;
  onFrequencyChange: (frequency: string) => void;
}

export const ScheduleTypeSelector = ({
  scheduleType,
  onScheduleTypeChange,
  frequency,
  onFrequencyChange,
}: ScheduleTypeSelectorProps) => {
  return (
    <div className="space-y-4">
      <Label>Schedule Type</Label>
      <RadioGroup
        value={scheduleType}
        onValueChange={(value) => onScheduleTypeChange(value as "frequency" | "custom")}
        className="space-y-2"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="frequency" id="frequency" />
          <Label htmlFor="frequency">Regular frequency</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="custom" id="custom" />
          <Label htmlFor="custom">Custom days of week</Label>
        </div>
      </RadioGroup>

      {scheduleType === "frequency" && (
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="frequency-select" className="text-right">
            Every
          </Label>
          <Select value={frequency} onValueChange={onFrequencyChange}>
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 days (Weekly)</SelectItem>
              <SelectItem value="14">14 days (Bi-weekly)</SelectItem>
              <SelectItem value="30">30 days (Monthly)</SelectItem>
              <SelectItem value="60">60 days (Every 2 months)</SelectItem>
              <SelectItem value="90">90 days (Every 3 months)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};
