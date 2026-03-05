
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  CreditCard, 
  Truck, 
  CheckCircle,
  ShoppingCart
} from "lucide-react";
import CheckoutStepper from "@/components/checkout/CheckoutStepper";
import DeliveryStep from "@/components/checkout/steps/DeliveryStep";
import PaymentStep from "@/components/checkout/steps/PaymentStep";
import ConfirmationStep from "@/components/checkout/steps/ConfirmationStep";
import EmptyCartState from "@/components/checkout/EmptyCartState";
import BottomNavigation from "@/components/mobile/BottomNavigation";
import { useCheckout } from "@/hooks/useCheckout";
import { convertToDeliveryAddress } from "@/utils/checkoutUtils";

const steps = [
  { id: "cart", title: "Cart", icon: ShoppingCart },
  { id: "delivery", title: "Delivery", icon: Truck },
  { id: "payment", title: "Payment", icon: CreditCard },
  { id: "confirmation", title: "Done", icon: CheckCircle },
];

const Checkout = () => {
  const nav = useNavigate();
  const {
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
    setSelectedAddress,
    setSelectedDelivery,
    setSelectedPayment,
    nextStep,
    prevStep,
    placeOrder,
    navigate
  } = useCheckout();

  const [deliveryAddress, setDeliveryAddress] = useState(
    convertToDeliveryAddress(selectedAddress)
  );
  
  // Show empty cart state if no items and not on confirmation step
  if (items.length === 0 && currentStep !== "confirmation") {
    return (
      <div className="flex flex-col min-h-screen pb-20 md:pb-0">
        <Header />
        <main className="flex-grow pt-20 pb-16 px-4 flex items-center justify-center">
          <EmptyCartState onContinueShopping={() => navigate("/shop")} />
        </main>
        <Footer />
        <BottomNavigation />
      </div>
    );
  }
  
  // Actually redirect to login instead of showing a message
  if (!isAuthenticated && currentStep !== "confirmation") {
    nav("/login", { state: { from: "/checkout" } });
    return null;
  }

  const handleAddressChange = (newAddress: any) => {
    setDeliveryAddress(newAddress);
    if (newAddress.location) {
      const updatedAddress = {
        id: selectedAddress?.id || "temp",
        street: newAddress.street || "",
        city: newAddress.city || "",
        state: "Kenya",
        zipCode: newAddress.postalCode || "",
        isDefault: selectedAddress?.isDefault || false
      };
      setSelectedAddress(updatedAddress);
    }
  };

  const handlePlaceOrder = (phoneNumber?: string) => {
    placeOrder(deliveryAddress, phoneNumber);
  };
  
  return (
    <div className="flex flex-col min-h-screen pb-20 md:pb-0">
      <Header />
      <main className="flex-grow pt-20 md:pt-24 pb-16 px-3 md:px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Mobile-friendly header */}
          <div className="mb-4 md:mb-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate(-1)} 
              className="mb-2 md:mb-4 -ml-2 h-9"
              size="sm"
              disabled={isProcessing}
            >
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Back
            </Button>
            
            <h1 className="text-xl md:text-3xl font-bold">Checkout</h1>
            
            <div className="my-4 md:my-8">
              <CheckoutStepper steps={steps} currentStep={currentStep} />
            </div>
          </div>
          
          {currentStep === "delivery" && (
            <DeliveryStep
              deliveryAddress={deliveryAddress}
              onAddressChange={handleAddressChange}
              selectedDelivery={selectedDelivery}
              setSelectedDelivery={setSelectedDelivery}
              items={items}
              total={total}
              onNext={nextStep}
              isProcessing={isProcessing}
            />
          )}
          
          {currentStep === "payment" && (
            <PaymentStep
              selectedPayment={selectedPayment}
              setSelectedPayment={setSelectedPayment}
              items={items}
              total={total}
              selectedDelivery={selectedDelivery}
              deliveryAddress={deliveryAddress}
              onNext={handlePlaceOrder}
              onPrev={prevStep}
              isProcessing={isProcessing}
            />
          )}
          
          {currentStep === "confirmation" && completedOrder && (
            <ConfirmationStep
              completedOrder={completedOrder}
              onTrackOrder={(orderId) => navigate(`/orders/${orderId}`)}
              onContinueShopping={() => navigate("/shop")}
            />
          )}
        </div>
      </main>
      <Footer />
      <BottomNavigation />
    </div>
  );
};

export default Checkout;
