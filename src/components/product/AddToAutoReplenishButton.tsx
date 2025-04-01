
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import { RefreshCw, Loader2 } from "lucide-react";
import { 
  Dialog,
  DialogClose, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { addToAutoReplenish } from "@/services/autoReplenishService";

interface AddToAutoReplenishButtonProps {
  productId: string;
  productName: string;
}

const AddToAutoReplenishButton = ({ productId, productName }: AddToAutoReplenishButtonProps) => {
  const { isAuthenticated } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [frequency, setFrequency] = useState(30); // Default 30 days
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const handleAddToAutoReplenish = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Please Login",
        description: "You need to log in to use this feature",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessing(true);
    try {
      const success = await addToAutoReplenish(productId, quantity, frequency);
      
      if (success) {
        setIsDialogOpen(false);
        toast({
          title: "Added to Auto-Replenish",
          description: `${productName} will be automatically ordered every ${frequency} days`,
        });
      }
    } catch (error) {
      console.error("Error adding to auto-replenish:", error);
      toast({
        title: "Failed to add product",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Auto-Replenish
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set Up Auto-Replenish</DialogTitle>
          <DialogDescription>
            {productName} will be automatically ordered on your chosen schedule
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
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Confirm"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddToAutoReplenishButton;
