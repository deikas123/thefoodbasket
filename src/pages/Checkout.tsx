
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  CreditCard, 
  Truck, 
  Clock, 
  CheckCircle,
  ShoppingCart
} from "lucide-react";
import CheckoutStepper from "@/components/checkout/CheckoutStepper";
import DeliveryStep from "@/components/checkout/steps/DeliveryStep";
import PaymentStep from "@/components/checkout/steps/PaymentStep";
import ConfirmationStep from "@/components/checkout/steps/ConfirmationStep";
import EmptyCartState from "@/components/checkout/EmptyCartState";
import { useCheckout } from "@/hooks/useCheckout";
import { convertToDeliveryAddress } from "@/utils/checkoutUtils";

const steps = [
  { id: "cart", title: "Cart", icon: ShoppingCart },
  { id: "delivery", title: "Delivery", icon: Truck },
  { id: "payment", title: "Payment", icon: CreditCard },
  { id: "confirmation", title: "Confirmation", icon: CheckCircle },
];

const Checkout = () => {
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
  
  if (items.length === 0 && currentStep !== "confirmation") {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow pt-24 pb-16 px-4 flex items-center justify-center">
          <EmptyCartState onContinueShopping={() => navigate("/shop")} />
        </main>
        <Footer />
      </div>
    );
  }
  
  if (!isAuthenticated && currentStep !== "confirmation") {
    navigate("/login", { state: { from: "/checkout" } });
    return null;
  }

  const handleAddressChange = (newAddress: any) => {
    setDeliveryAddress(newAddress);
    
    // Update selectedAddress if the location changes
    if (newAddress.location) {
      const updatedAddress = {
        id: selectedAddress?.id || "temp",
        street: newAddress.street || "",
        city: newAddress.city || "",
        state: "Kenya", // Default state
        zipCode: newAddress.postalCode || "",
        isDefault: selectedAddress?.isDefault || false
      };
      setSelectedAddress(updatedAddress);
    }
  };

  const handlePlaceOrder = () => {
    placeOrder(deliveryAddress);
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-6 sm:mb-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate(-1)} 
              className="mb-4"
              disabled={isProcessing}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            
            <h1 className="text-2xl sm:text-3xl font-bold">Checkout</h1>
            
            <div className="my-6 sm:my-8">
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
    </div>
  );
};

export default Checkout;
