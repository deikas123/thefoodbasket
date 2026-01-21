import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";

interface CustomDaysSelectorProps {
  selectedDays: string[];
  onDaysChange: (days: string[]) => void;
}

const DAYS = [
  { value: "0", label: "Sun", fullLabel: "Sunday" },
  { value: "1", label: "Mon", fullLabel: "Monday" },
  { value: "2", label: "Tue", fullLabel: "Tuesday" },
  { value: "3", label: "Wed", fullLabel: "Wednesday" },
  { value: "4", label: "Thu", fullLabel: "Thursday" },
  { value: "5", label: "Fri", fullLabel: "Friday" },
  { value: "6", label: "Sat", fullLabel: "Saturday" },
];

export const CustomDaysSelector = ({ selectedDays, onDaysChange }: CustomDaysSelectorProps) => {
  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      onDaysChange(selectedDays.filter(d => d !== day));
    } else {
      onDaysChange([...selectedDays, day]);
    }
  };

  return (
    <div className="space-y-3">
      <Label>Select delivery days</Label>
      <div className="flex flex-wrap gap-2">
        {DAYS.map((day) => {
          const isSelected = selectedDays.includes(day.value);
          return (
            <motion.button
              key={day.value}
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggleDay(day.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                isSelected
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
              title={day.fullLabel}
            >
              {day.label}
            </motion.button>
          );
        })}
      </div>
      {selectedDays.length > 0 && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-muted-foreground"
        >
          Delivers every {selectedDays.map(d => DAYS.find(day => day.value === d)?.fullLabel).join(", ")}
        </motion.p>
      )}
    </div>
  );
};
