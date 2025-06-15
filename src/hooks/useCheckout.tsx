
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/components/ui/use-toast";
import { Address, PaymentMethod, Order } from "@/types";
import { DeliveryOption } from "@/services/deliveryOptionsService";

export const useCheckout = () => {
  const navigate = useNavigate();
  const { items, total, checkout } = useCart();
  const { user, isAuthenticated } = useAuth();
  
  console.log("useCheckout initialized:", {
    itemsCount: items.length,
    total,
    isAuthenticated,
    userPresent: !!user
  });
  
  const [currentStep, setCurrentStep] = useState("delivery");
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(
    user?.addresses?.find(addr => addr.isDefault) || null
  );
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryOption | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  const nextStep = () => {
    console.log("Moving to next step from:", currentStep);
    
    if (currentStep === "delivery") {
      if (!selectedDelivery) {
        toast({
          title: "Please select a delivery option",
          description: "You need to select a delivery option to continue.",
          variant: "destructive",
        });
        return;
      }
      setCurrentStep("payment");
    } else if (currentStep === "payment") {
      if (!selectedPayment) {
        toast({
          title: "Please select a payment method",
          description: "You need to select a payment method to continue.",
          variant: "destructive",
        });
        return;
      }
      // Note: placeOrder will be called from the component with the delivery address
      setCurrentStep("confirmation");
    }
  };
  
  const prevStep = () => {
    console.log("Moving to previous step from:", currentStep);
    
    if (currentStep === "payment") {
      setCurrentStep("delivery");
    } else if (currentStep === "confirmation") {
      setCurrentStep("payment");
    }
  };
  
  const placeOrder = async (deliveryAddress: any) => {
    console.log("Placing order with:", {
      user: !!user,
      selectedDelivery: !!selectedDelivery,
      selectedPayment: !!selectedPayment,
      deliveryAddress
    });
    
    if (!user || !selectedDelivery || !selectedPayment) {
      toast({
        title: "Incomplete information",
        description: "Please fill in all required information.",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Convert delivery address to Address format for checkout
      const addressForCheckout: Address = {
        id: selectedAddress?.id || "temp",
        street: deliveryAddress.street,
        city: deliveryAddress.city,
        state: "Kenya",
        zipCode: deliveryAddress.postalCode,
        isDefault: false
      };

      // Convert new delivery option format to old format for checkout
      const deliveryOptionForCheckout = {
        id: selectedDelivery.id,
        name: selectedDelivery.name,
        price: selectedDelivery.base_price,
        estimatedDelivery: `${selectedDelivery.estimated_delivery_days} days`
      };

      const order = await checkout(
        user.id,
        addressForCheckout,
        deliveryOptionForCheckout,
        selectedPayment
      );
      
      console.log("Order placed successfully:", order);
      
      setCompletedOrder(order);
      setCurrentStep("confirmation");
      
      toast({
        title: "Order placed successfully!",
        description: "Thank you for your order. We'll process it right away.",
      });
    } catch (error) {
      console.error("Error placing order:", error);
      toast({
        title: "Failed to place order",
        description: "There was an error processing your order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    // State
    currentStep,
    selectedAddress,
    selectedDelivery,
    selectedPayment,
    isProcessing,
    completedOrder,
    items,
    total,
    user,
    isAuthenticated,
    
    // Actions
    setSelectedAddress,
    setSelectedDelivery,
    setSelectedPayment,
    nextStep,
    prevStep,
    placeOrder,
    navigate
  };
};
