
import { CartItem } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import { DeliveryOption } from "@/services/deliveryOptionsService";
import { calculateDeliveryFee } from "@/services/deliveryCalculationService";
import OrderItems from "./orderSummary/OrderItems";
import OrderTotals from "./orderSummary/OrderTotals";
import AutoReplenishDialog from "./orderSummary/AutoReplenishDialog";

interface OrderSummaryProps {
  items: CartItem[];
  subtotal: number;
  deliveryFee?: number;
  discount?: number;
  selectedDelivery?: DeliveryOption | null;
  deliveryAddress?: any;
  children?: React.ReactNode;
  onNext?: () => void;
  isProcessing?: boolean;
  buttonText?: string;
}

const OrderSummary = ({ 
  items, 
  subtotal, 
  deliveryFee = 0,
  discount = 0,
  selectedDelivery,
  deliveryAddress,
  children,
  onNext,
  isProcessing = false,
  buttonText = "Continue"
}: OrderSummaryProps) => {
  const [calculatedDeliveryFee, setCalculatedDeliveryFee] = useState(deliveryFee);
  const { isAuthenticated } = useAuth();
  const [selectedItem, setSelectedItem] = useState<CartItem | null>(null);

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
  };

  const closeAutoReplenishDialog = () => {
    setSelectedItem(null);
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
        <OrderItems 
          items={items} 
          onAutoReplenishClick={openAutoReplenishDialog}
        />
        
        <OrderTotals 
          subtotal={subtotal}
          deliveryFee={calculatedDeliveryFee}
          discount={discount}
          total={total}
        />

        {onNext && (
          <div className="mt-4">
            <Button 
              className="w-full" 
              size="lg" 
              onClick={onNext}
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : buttonText}
            </Button>
          </div>
        )}

        {children && (
          <div className="mt-4">
            {children}
          </div>
        )}

        <AutoReplenishDialog 
          selectedItem={selectedItem}
          onClose={closeAutoReplenishDialog}
        />
      </CardContent>
    </Card>
  );
};

export default OrderSummary;
