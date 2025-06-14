
import { useState } from "react";
import { CartItem } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { addToAutoReplenish } from "@/services/autoReplenishService";
import { toast } from "@/hooks/use-toast";

interface AutoReplenishDialogProps {
  selectedItem: CartItem | null;
  onClose: () => void;
}

const AutoReplenishDialog = ({ selectedItem, onClose }: AutoReplenishDialogProps) => {
  const [frequency, setFrequency] = useState(30);
  const [quantity, setQuantity] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  // Set quantity when selectedItem changes
  useState(() => {
    if (selectedItem) {
      setQuantity(selectedItem.quantity);
    }
  });

  const handleAddToAutoReplenish = async () => {
    if (!selectedItem) return;
    
    setIsProcessing(true);
    try {
      const success = await addToAutoReplenish(selectedItem.product.id, quantity, frequency);
      
      if (success) {
        toast({
          title: "Added to Auto-Replenish",
          description: `${selectedItem.product.name} will be automatically ordered every ${frequency} days`,
        });
        onClose();
      }
    } catch (error) {
      console.error("Error adding to auto-replenish:", error);
      toast({
        title: "Failed to set up auto-replenish",
        description: "Please try again or contact support",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={!!selectedItem} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set Up Auto-Replenish</DialogTitle>
          <DialogDescription>
            {selectedItem?.product.name} will be automatically ordered on your chosen schedule
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <div className="flex items-center">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="rounded-r-none"
                onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                disabled={quantity <= 1}
              >
                -
              </Button>
              <Input
                id="quantity"
                type="number"
                min="1"
                className="rounded-none text-center"
                value={quantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (!isNaN(val) && val > 0) setQuantity(val);
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="rounded-l-none"
                onClick={() => setQuantity(quantity + 1)}
              >
                +
              </Button>
            </div>
          </div>
          
          <div className="space-y-4">
            <Label>Frequency</Label>
            <RadioGroup value={String(frequency)} onValueChange={(value) => setFrequency(parseInt(value))}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="30" id="30days" />
                <Label htmlFor="30days">Every 30 days</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="60" id="60days" />
                <Label htmlFor="60days">Every 60 days</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="90" id="90days" />
                <Label htmlFor="90days">Every 90 days</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
        
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button 
            onClick={handleAddToAutoReplenish} 
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AutoReplenishDialog;
