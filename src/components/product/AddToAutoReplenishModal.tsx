
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { addToAutoReplenish } from '@/services/autoReplenishService';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

interface AddToAutoReplenishModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
}

const AddToAutoReplenishModal = ({ isOpen, onClose, productId, productName }: AddToAutoReplenishModalProps) => {
  const [quantity, setQuantity] = useState(1);
  const [frequency, setFrequency] = useState('30');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/product/${productId}` } });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const success = await addToAutoReplenish(
        productId,
        quantity,
        parseInt(frequency)
      );
      
      if (success) {
        toast({
          title: "Success!",
          description: `${productName} has been added to your Auto-Replenish schedule.`,
        });
        onClose();
      }
    } catch (error) {
      console.error("Error adding to auto replenish:", error);
      toast({
        title: "Error",
        description: "There was a problem setting up Auto-Replenish. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const frequencyOptions = [
    { value: '7', label: 'Every week' },
    { value: '14', label: 'Every 2 weeks' },
    { value: '30', label: 'Monthly' },
    { value: '60', label: 'Every 2 months' },
    { value: '90', label: 'Every 3 months' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Set Auto Replenish</DialogTitle>
          <DialogDescription>
            Set up automatic delivery for {productName}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right">
                Quantity
              </Label>
              <Input
                id="quantity"
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="frequency" className="text-right">
                Frequency
              </Label>
              <Select value={frequency} onValueChange={setFrequency}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  {frequencyOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Setting up..." : "Set Auto Replenish"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddToAutoReplenishModal;
