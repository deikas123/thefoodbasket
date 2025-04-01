import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  CreditCard, 
  Truck, 
  Clock, 
  CheckCircle,
  ShoppingCart
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import DeliveryOptions from "@/components/checkout/DeliveryOptions";
import DeliveryAddressForm from "@/components/checkout/DeliveryAddressForm";
import PaymentMethods from "@/components/checkout/PaymentMethods";
import OrderSummary from "@/components/checkout/OrderSummary";
import CheckoutStepper from "@/components/checkout/CheckoutStepper";
import { Address, DeliveryOption, PaymentMethod, Order } from "@/types";

const steps = [
  { id: "cart", title: "Cart", icon: ShoppingCart },
  { id: "delivery", title: "Delivery", icon: Truck },
  { id: "payment", title: "Payment", icon: CreditCard },
  { id: "confirmation", title: "Confirmation", icon: CheckCircle },
];

const Checkout = () => {
  const navigate = useNavigate();
  const { items, total, checkout } = useCart();
  const { user, isAuthenticated } = useAuth();
  
  const [currentStep, setCurrentStep] = useState("delivery");
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(
    user?.addresses.find(addr => addr.isDefault) || null
  );
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryOption | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  
  if (items.length === 0 && currentStep !== "confirmation") {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow pt-24 pb-16 px-4 flex items-center justify-center">
          <Card className="w-full max-w-lg text-center p-8">
            <CardContent className="pt-6 space-y-4">
              <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground" />
              <h1 className="text-2xl font-bold">Your Cart is Empty</h1>
              <p className="text-muted-foreground">
                Add some products to your cart before proceeding to checkout.
              </p>
            </CardContent>
            <CardFooter className="flex justify-center pt-6">
              <Button onClick={() => navigate("/shop")}>
                Continue Shopping
              </Button>
            </CardFooter>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (!isAuthenticated && currentStep !== "confirmation") {
    navigate("/login", { state: { from: "/checkout" } });
    return null;
  }
  
  const nextStep = () => {
    if (currentStep === "delivery") {
      if (!selectedAddress) {
        toast({
          title: "Please select a delivery address",
          description: "You need to select a delivery address to continue.",
          variant: "destructive",
        });
        return;
      }
      
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
      
      placeOrder();
    }
  };
  
  const prevStep = () => {
    if (currentStep === "payment") {
      setCurrentStep("delivery");
    } else if (currentStep === "confirmation") {
      setCurrentStep("payment");
    }
  };
  
  const placeOrder = async () => {
    if (!user || !selectedAddress || !selectedDelivery || !selectedPayment) {
      toast({
        title: "Incomplete information",
        description: "Please fill in all required information.",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const order = await checkout(
        user.id,
        selectedAddress,
        selectedDelivery,
        selectedPayment
      );
      
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
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate(-1)} 
              className="mb-4"
              disabled={isProcessing}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            
            <h1 className="text-3xl font-bold">Checkout</h1>
            
            <div className="my-8">
              <CheckoutStepper steps={steps} currentStep={currentStep} />
            </div>
          </div>
          
          {currentStep === "delivery" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <Card>
                  <CardContent className="pt-6">
                    <h2 className="text-xl font-semibold flex items-center mb-4">
                      <Truck className="mr-2 h-5 w-5 text-primary" />
                      Delivery Address
                    </h2>
                    
                    <DeliveryAddressForm 
                      selectedAddress={selectedAddress}
                      setSelectedAddress={setSelectedAddress}
                    />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <h2 className="text-xl font-semibold flex items-center mb-4">
                      <Clock className="mr-2 h-5 w-5 text-primary" />
                      Delivery Options
                    </h2>
                    
                    <DeliveryOptions 
                      selectedDelivery={selectedDelivery}
                      setSelectedDelivery={setSelectedDelivery}
                      postalCode={selectedAddress?.zipCode || "00100"}
                    />
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <OrderSummary 
                  items={items}
                  subtotal={total}
                  deliveryFee={selectedDelivery?.price || 0}
                />
                
                <div className="mt-4">
                  <Button 
                    className="w-full" 
                    size="lg" 
                    onClick={nextStep}
                    disabled={isProcessing}
                  >
                    Continue to Payment
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          {currentStep === "payment" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Card>
                  <CardContent className="pt-6">
                    <h2 className="text-xl font-semibold flex items-center mb-4">
                      <CreditCard className="mr-2 h-5 w-5 text-primary" />
                      Payment Method
                    </h2>
                    
                    <PaymentMethods 
                      selectedPayment={selectedPayment}
                      setSelectedPayment={setSelectedPayment}
                      orderTotal={total}
                    />
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <OrderSummary 
                  items={items}
                  subtotal={total}
                  deliveryFee={selectedDelivery?.price || 0}
                />
                
                <div className="mt-4 space-y-3">
                  <Button 
                    className="w-full" 
                    size="lg" 
                    onClick={nextStep}
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Processing..." : "Place Order"}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={prevStep}
                    disabled={isProcessing}
                  >
                    Back to Delivery
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          {currentStep === "confirmation" && completedOrder && (
            <div className="max-w-2xl mx-auto text-center">
              <div className="mb-8">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="h-10 w-10 text-primary" />
                </div>
                
                <h2 className="text-2xl font-bold mb-2">Order Confirmed!</h2>
                <p className="text-muted-foreground mb-6">
                  Your order #{completedOrder.id} has been placed and is being processed. You will receive a confirmation email shortly.
                </p>
                
                <div className="p-6 border rounded-md mb-8 text-left">
                  <div className="mb-4">
                    <h3 className="font-medium mb-2">Delivery Address:</h3>
                    <p>
                      {completedOrder.deliveryAddress.street}, {completedOrder.deliveryAddress.city}<br />
                      {completedOrder.deliveryAddress.state}, {completedOrder.deliveryAddress.zipCode}
                    </p>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="mb-4">
                    <h3 className="font-medium mb-2">Delivery Method:</h3>
                    <p>{completedOrder.deliveryMethod.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Estimated delivery: {completedOrder.estimatedDelivery}
                    </p>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div>
                    <h3 className="font-medium mb-2">Payment Method:</h3>
                    <p>{completedOrder.paymentMethod.name}</p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button onClick={() => navigate(`/orders/${completedOrder.id}`)}>
                    <Truck className="mr-2 h-4 w-4" />
                    Track Order
                  </Button>
                  
                  <Button variant="outline" onClick={() => navigate("/shop")}>
                    Continue Shopping
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;
