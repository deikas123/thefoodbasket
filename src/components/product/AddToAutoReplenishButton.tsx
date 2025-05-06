
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
import { useAutoReplenish } from "@/hooks/useAutoReplenish";

interface AddToAutoReplenishButtonProps {
  productId: string;
  productName: string;
}

const AddToAutoReplenishButton = ({ productId, productName }: AddToAutoReplenishButtonProps) => {
  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [frequency, setFrequency] = useState("30");
  const { addItem, isLoading } = useAutoReplenish();

  const handleSubmit = async () => {
    await addItem({
      productId,
      quantity: Number(quantity),
      frequencyDays: Number(frequency)
    });
    setOpen(false);
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Up Auto-Replenishment</DialogTitle>
            <DialogDescription>
              Have {productName} regularly delivered to you without having to reorder.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
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
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="frequency" className="text-right">
                Frequency
              </Label>
              <Select
                value={frequency}
                onValueChange={setFrequency}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select frequency" />
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
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? "Setting up..." : "Set up auto-replenishment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddToAutoReplenishButton;
