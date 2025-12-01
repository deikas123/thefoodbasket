
import { PaymentMethod } from "@/types";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  Smartphone, 
  CircleDollarSign, 
  ShieldCheck,
  Wallet,
  BanknoteIcon
} from "lucide-react";
import WalletPaymentOption from "@/components/wallet/WalletPaymentOption";
import PayLaterCheckoutOption from "@/components/checkout/PayLaterCheckoutOption";

interface PaymentMethodsProps {
  selectedPayment: PaymentMethod | null;
  setSelectedPayment: (method: PaymentMethod) => void;
  orderTotal: number;
}

// Enhanced payment methods for Kenya with better ordering
const paymentMethods: PaymentMethod[] = [
  {
    id: "mpesa",
    name: "M-Pesa",
    type: "mpesa",
    icon: "smartphone",
    description: "Pay with M-Pesa STK Push"
  },
  {
    id: "card",
    name: "Credit/Debit Card",
    type: "card",
    icon: "credit-card",
    description: "Pay with Visa, Mastercard (Coming Soon)"
  },
  {
    id: "wallet",
    name: "E-Wallet",
    type: "wallet",
    icon: "wallet",
    description: "Pay using your store wallet balance"
  },
  {
    id: "paylater",
    name: "Buy Now, Pay Later",
    type: "paylater",
    icon: "calendar",
    description: "Pay within 30 days with no interest"
  },
  {
    id: "cod",
    name: "Cash on Delivery",
    type: "cod",
    icon: "cash",
    description: "Pay with cash when your order is delivered"
  }
];

const PaymentMethodIcon = ({ icon }: { icon: string }) => {
  switch (icon) {
    case "credit-card":
      return <CreditCard className="h-5 w-5 text-primary" />;
    case "smartphone":
      return <Smartphone className="h-5 w-5 text-green-600" />;
    case "wallet":
      return <Wallet className="h-5 w-5 text-purple-600" />;
    case "calendar":
      return <CircleDollarSign className="h-5 w-5 text-blue-600" />;
    case "cash":
      return <BanknoteIcon className="h-5 w-5 text-amber-500" />;
    default:
      return null;
  }
};

const PaymentMethods = ({ 
  selectedPayment, 
  setSelectedPayment,
  orderTotal
}: PaymentMethodsProps) => {
  // Handle wallet payment selection
  const handleWalletSelect = (selected: boolean) => {
    if (selected) {
      setSelectedPayment({
        id: "wallet",
        name: "E-Wallet",
        type: "wallet",
        icon: "wallet",
      });
    } else {
      setSelectedPayment(paymentMethods[0]); // Default to first payment method
    }
  };
  
  // Handle pay later selection
  const handlePayLaterSelect = (selected: boolean) => {
    if (selected) {
      setSelectedPayment({
        id: "paylater",
        name: "Buy Now, Pay Later",
        type: "paylater",
        icon: "calendar",
      });
    } else {
      setSelectedPayment(paymentMethods[0]); // Default to first payment method
    }
  };
  
  return (
    <>
      <div className="space-y-6">
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-4">Payment Options</h3>
          
          {/* Wallet Option */}
          <WalletPaymentOption 
            totalAmount={orderTotal}
            onWalletSelect={handleWalletSelect}
          />
          
          {/* Pay Later Option */}
          <div className="mt-4">
            <PayLaterCheckoutOption 
              totalAmount={orderTotal}
              onPayLaterSelect={handlePayLaterSelect}
            />
          </div>
        </div>
        
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-4">Other Payment Methods</h3>
          
          <RadioGroup 
            value={selectedPayment?.id} 
            onValueChange={(value) => {
              const method = paymentMethods.find(m => m.id === value);
              if (method && method.id !== "wallet" && method.id !== "paylater") {
                setSelectedPayment(method);
              }
            }}
            className="space-y-3"
          >
            {paymentMethods
              .filter(method => method.id !== "wallet" && method.id !== "paylater")
              .map((method) => (
                <div
                  key={method.id}
                  className={`flex items-start space-x-2 border rounded-lg p-4 transition-colors hover:bg-accent/50 ${selectedPayment?.id === method.id ? 'border-primary bg-accent/30' : ''}`}
                >
                  <RadioGroupItem value={method.id} id={method.id} className="mt-1" />
                  <div className="flex-1">
                    <Label 
                      htmlFor={method.id}
                      className="flex items-center cursor-pointer"
                    >
                      <PaymentMethodIcon icon={method.icon} />
                      <span className="font-medium ml-2">{method.name}</span>
                      
                      {method.id === "mpesa" && (
                        <Badge variant="outline" className="ml-2 bg-green-50 text-green-600 border-green-200">Popular in Kenya</Badge>
                      )}
                    </Label>
                    
                    <p className="text-sm text-muted-foreground mt-1 ml-7">
                      {method.description}
                    </p>
                  </div>
                </div>
              ))}
          </RadioGroup>
        </div>
      </div>
      
      <div className="mt-6 flex items-center text-sm text-muted-foreground border rounded-md p-3 bg-muted/50">
        <ShieldCheck className="h-5 w-5 mr-2 text-primary" />
        <p>All payment information is encrypted and securely processed</p>
      </div>
    </>
  );
};

export default PaymentMethods;
