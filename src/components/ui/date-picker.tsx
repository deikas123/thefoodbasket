
import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";

interface DatePickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  showTimePicker?: boolean;
  disabled?: (date: Date) => boolean;
}

export function DatePicker({ date, setDate, showTimePicker = false, disabled }: DatePickerProps) {
  const [selectedHour, setSelectedHour] = React.useState<string>("12");
  const [selectedMinute, setSelectedMinute] = React.useState<string>("00");
  
  // Update time when date changes
  React.useEffect(() => {
    if (date) {
      setSelectedHour(String(date.getHours()).padStart(2, '0'));
      setSelectedMinute(String(date.getMinutes()).padStart(2, '0'));
    } else {
      setSelectedHour("12");
      setSelectedMinute("00");
    }
  }, [date]);
  
  // Update date with new time when hour or minute changes
  React.useEffect(() => {
    if (date && showTimePicker) {
      const newDate = new Date(date);
      newDate.setHours(parseInt(selectedHour));
      newDate.setMinutes(parseInt(selectedMinute));
      setDate(newDate);
    }
  }, [selectedHour, selectedMinute, showTimePicker]);
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? (
            format(date, showTimePicker ? 'PPP HH:mm' : 'PPP')
          ) : (
            <span>Pick a date</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          disabled={disabled}
          initialFocus
        />
        
        {showTimePicker && (
          <div className="p-3 border-t border-border">
            <div className="flex items-center">
              <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Time</span>
            </div>
            <div className="flex space-x-2 mt-2">
              <Select
                value={selectedHour}
                onValueChange={setSelectedHour}
              >
                <SelectTrigger className="w-20">
                  <SelectValue placeholder="Hour" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 24 }).map((_, i) => (
                    <SelectItem key={i} value={String(i).padStart(2, '0')}>
                      {String(i).padStart(2, '0')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center">:</div>
              <Select
                value={selectedMinute}
                onValueChange={setSelectedMinute}
              >
                <SelectTrigger className="w-20">
                  <SelectValue placeholder="Min" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 60 }).map((_, i) => (
                    <SelectItem key={i} value={String(i).padStart(2, '0')}>
                      {String(i).padStart(2, '0')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
