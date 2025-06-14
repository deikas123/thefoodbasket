import { CartItem } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, RefreshCw } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/utils/currencyFormatter";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { addToAutoReplenish } from "@/services/autoReplenishService";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import { DeliveryOption } from "@/services/deliveryOptionsService";
import { calculateDeliveryFee } from "@/services/deliveryCalculationService";

interface OrderSummaryProps {
  items: CartItem[];
  subtotal: number;
  deliveryFee?: number;
  discount?: number;
  selectedDelivery?: DeliveryOption | null;
  deliveryAddress?: any;
  children?: React.ReactNode;
}

const OrderSummary = ({ 
  items, 
  subtotal, 
  deliveryFee = 0,
  discount = 0,
  selectedDelivery,
  deliveryAddress,
  children
}: OrderSummaryProps) => {
  const [calculatedDeliveryFee, setCalculatedDeliveryFee] = useState(deliveryFee);
  const { isAuthenticated } = useAuth();
  const [selectedItem, setSelectedItem] = useState<CartItem | null>(null);
  const [frequency, setFrequency] = useState(30);
  const [quantity, setQuantity] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  // Calculate delivery fee when delivery option or address changes
  useEffect(() => {
    const calculateFee = async () => {
      if (selectedDelivery && deliveryAddress?.location) {
        try {
          const result = await calculateDeliveryFee(
            {
              deliveryLocation: deliveryAddress.location,
              orderTotal: subtotal
            },
            selectedDelivery.id
          );
          setCalculatedDeliveryFee(result.deliveryFee);
        } catch (error) {
          console.error('Error calculating delivery fee:', error);
          // Fallback to base price if calculation fails
          setCalculatedDeliveryFee(selectedDelivery.base_price || 0);
        }
      } else if (selectedDelivery) {
        // Use base price if no location is available
        setCalculatedDeliveryFee(selectedDelivery.base_price || 0);
      } else {
        setCalculatedDeliveryFee(deliveryFee);
      }
    };

    calculateFee();
  }, [selectedDelivery, deliveryAddress, subtotal, deliveryFee]);

  // Calculate total using the calculated delivery fee
  const total = subtotal + calculatedDeliveryFee - discount;

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
        setSelectedItem(null);
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
  
  const openAutoReplenishDialog = (item: CartItem) => {
    if (!isAuthenticated) {
      toast({
        title: "Please login",
        description: "You need to be logged in to use the auto-replenish feature",
        variant: "destructive",
      });
      return;
    }
    
    setSelectedItem(item);
    setQuantity(item.quantity);
  };
  
  return (
    <Card className="sticky top-24">
      <CardHeader className="bg-muted/10 py-4">
        <CardTitle className="flex items-center">
          <ShoppingCart className="mr-2 h-5 w-5" />
          Order Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-2">
            {items.length} item{items.length !== 1 && 's'} in cart
          </p>
          
          <div className="max-h-40 overflow-auto space-y-2">
            {items.map(item => (
              <div key={item.product.id} className="flex justify-between text-sm">
                <div className="flex items-center">
                  <span className="font-medium">{item.quantity} x</span>
                  <span className="ml-2 truncate max-w-[140px]">{item.product.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>{formatCurrency(item.product.price * item.quantity)}</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6" 
                    title="Set auto-replenish"
                    onClick={() => openAutoReplenishDialog(item)}
                  >
                    <RefreshCw className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <Separator className="my-4" />
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">Delivery</span>
            <span>{formatCurrency(calculatedDeliveryFee)}</span>
          </div>
          
          {discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount</span>
              <span>-{formatCurrency(discount)}</span>
            </div>
          )}
        </div>
        
        <Separator className="my-4" />
        
        <div className="flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>

        {children && (
          <div className="mt-4">
            {children}
          </div>
        )}

        {/* Auto Replenish Dialog */}
        <Dialog open={!!selectedItem} onOpenChange={(isOpen) => !isOpen && setSelectedItem(null)}>
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
      </CardContent>
    </Card>
  );
};

export default OrderSummary;
