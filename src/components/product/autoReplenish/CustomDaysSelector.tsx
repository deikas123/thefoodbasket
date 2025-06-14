
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface CustomDaysSelectorProps {
  selectedDays: string[];
  onDaysChange: (days: string[]) => void;
}

export const CustomDaysSelector = ({
  selectedDays,
  onDaysChange,
}: CustomDaysSelectorProps) => {
  const daysOfWeek = [
    { value: "0", label: "Sunday" },
    { value: "1", label: "Monday" },
    { value: "2", label: "Tuesday" },
    { value: "3", label: "Wednesday" },
    { value: "4", label: "Thursday" },
    { value: "5", label: "Friday" },
    { value: "6", label: "Saturday" },
  ];

  const handleDayChange = (dayValue: string, checked: boolean) => {
    if (checked) {
      onDaysChange([...selectedDays, dayValue]);
    } else {
      onDaysChange(selectedDays.filter(day => day !== dayValue));
    }
  };

  return (
    <div className="space-y-3">
      <Label>Select days of the week</Label>
      <div className="grid grid-cols-2 gap-3">
        {daysOfWeek.map(day => (
          <div key={day.value} className="flex items-center space-x-2">
            <Checkbox
              id={`day-${day.value}`}
              checked={selectedDays.includes(day.value)}
              onCheckedChange={(checked) => 
                handleDayChange(day.value, checked as boolean)
              }
            />
            <Label htmlFor={`day-${day.value}`} className="text-sm">
              {day.label}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
};
