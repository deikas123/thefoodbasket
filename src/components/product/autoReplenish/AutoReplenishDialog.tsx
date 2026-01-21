import { useState, useEffect } from "react";
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
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Loader2, CalendarDays, Package, Clock, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format, addDays } from "date-fns";

interface AutoReplenishDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  productName: string;
  productImage?: string;
  productPrice?: number;
}

export const AutoReplenishDialog = ({ 
  open, 
  onOpenChange, 
  productId, 
  productName,
  productImage,
  productPrice
}: AutoReplenishDialogProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [scheduleType, setScheduleType] = useState<"frequency" | "custom">("frequency");
  const [frequency, setFrequency] = useState("30");
  const [customTime, setCustomTime] = useState("09:00");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const { addItem, isLoading } = useAutoReplenish();

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setQuantity(1);
      setScheduleType("frequency");
      setFrequency("30");
      setCustomTime("09:00");
      setSelectedDays([]);
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!user) {
      onOpenChange(false);
      navigate('/login', { state: { from: `/product/${productId}` } });
      return;
    }

    const success = await addItem({
      productId,
      quantity: Number(quantity),
      frequencyDays: scheduleType === "frequency" ? Number(frequency) : 7,
      customDays: scheduleType === "custom" ? selectedDays : undefined,
      customTime
    });
    
    if (success) {
      onOpenChange(false);
    }
  };

  const getNextDeliveryDate = () => {
    const days = scheduleType === "frequency" ? Number(frequency) : 7;
    return format(addDays(new Date(), days), "MMM d, yyyy");
  };

  const frequencyOptions = [
    { value: "7", label: "Weekly", description: "Every 7 days" },
    { value: "14", label: "Bi-weekly", description: "Every 2 weeks" },
    { value: "30", label: "Monthly", description: "Every 30 days" },
    { value: "60", label: "Every 2 months", description: "Every 60 days" },
    { value: "90", label: "Quarterly", description: "Every 3 months" }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            Set Up Auto-Replenishment
          </DialogTitle>
          <DialogDescription>
            Never run out! We'll automatically order this product for you on schedule.
          </DialogDescription>
        </DialogHeader>
        
        {/* Product Preview */}
        {(productImage || productName) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl"
          >
            {productImage && (
              <img 
                src={productImage} 
                alt={productName} 
                className="w-16 h-16 object-cover rounded-lg"
              />
            )}
            <div className="flex-1">
              <p className="font-medium line-clamp-2">{productName}</p>
              {productPrice && (
                <p className="text-sm text-muted-foreground">
                  KES {productPrice.toLocaleString()} per item
                </p>
              )}
            </div>
          </motion.div>
        )}

        <div className="grid gap-6 py-4">
          {/* Quantity */}
          <div className="space-y-2">
            <Label htmlFor="quantity" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Quantity per delivery
            </Label>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                -
              </Button>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="w-20 text-center"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setQuantity(quantity + 1)}
              >
                +
              </Button>
            </div>
          </div>

          {/* Frequency Selection */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Delivery frequency
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {frequencyOptions.map((option) => (
                <motion.button
                  key={option.value}
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setScheduleType("frequency");
                    setFrequency(option.value);
                  }}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    scheduleType === "frequency" && frequency === option.value
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <p className="font-medium text-sm">{option.label}</p>
                  <p className="text-xs text-muted-foreground">{option.description}</p>
                </motion.button>
              ))}
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setScheduleType("custom")}
                className={`p-3 rounded-xl border text-left transition-all ${
                  scheduleType === "custom"
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <p className="font-medium text-sm">Custom</p>
                <p className="text-xs text-muted-foreground">Pick days</p>
              </motion.button>
            </div>
          </div>

          {/* Custom Days Selector */}
          <AnimatePresence>
            {scheduleType === "custom" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <CustomDaysSelector
                  selectedDays={selectedDays}
                  onDaysChange={setSelectedDays}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Preferred Time */}
          <div className="space-y-2">
            <Label htmlFor="time" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Preferred delivery time
            </Label>
            <Input
              id="time"
              type="time"
              value={customTime}
              onChange={(e) => setCustomTime(e.target.value)}
              className="w-32"
            />
          </div>

          {/* Next Delivery Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-start gap-3 p-4 bg-primary/5 rounded-xl border border-primary/20"
          >
            <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm">First delivery</p>
              <p className="text-sm text-muted-foreground">
                {getNextDeliveryDate()} around {customTime}
              </p>
            </div>
          </motion.div>
        </div>
        
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isLoading || (scheduleType === "custom" && selectedDays.length === 0)}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Setting up...
              </>
            ) : (
              "Start Auto-Replenish"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
