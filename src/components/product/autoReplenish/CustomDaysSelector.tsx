
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface CustomDaysSelectorProps {
  selectedDays: string[];
  onDaysChange: (days: string[]) => void;
}

export const CustomDaysSelector = ({ selectedDays, onDaysChange }: CustomDaysSelectorProps) => {
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
    onDaysChange(
      selectedDays.includes(dayValue) 
        ? selectedDays.filter(d => d !== dayValue)
        : [...selectedDays, dayValue]
    );
  };

  return (
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
  );
};
