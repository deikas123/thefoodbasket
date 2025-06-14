
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ScheduleTypeSelectorProps {
  scheduleType: "frequency" | "custom";
  onScheduleTypeChange: (value: "frequency" | "custom") => void;
  frequency: string;
  onFrequencyChange: (value: string) => void;
}

export const ScheduleTypeSelector = ({
  scheduleType,
  onScheduleTypeChange,
  frequency,
  onFrequencyChange
}: ScheduleTypeSelectorProps) => {
  return (
    <>
      {/* Schedule Type */}
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="schedule-type" className="text-right">
          Schedule
        </Label>
        <Select value={scheduleType} onValueChange={onScheduleTypeChange}>
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
          <Select value={frequency} onValueChange={onFrequencyChange}>
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
    </>
  );
};
