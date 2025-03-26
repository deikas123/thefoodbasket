
import { PaymentMethod } from "@/types";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  Smartphone, 
  CircleDollarSign, 
  ShieldCheck 
} from "lucide-react";

interface PaymentMethodsProps {
  selectedPayment: PaymentMethod | null;
  setSelectedPayment: (method: PaymentMethod) => void;
}

// Mock payment methods
const paymentMethods: PaymentMethod[] = [
  {
    id: "card",
    name: "Credit/Debit Card",
    icon: "credit-card",
    description: "Pay with Visa, Mastercard, or American Express"
  },
  {
    id: "mpesa",
    name: "M-Pesa",
    icon: "smartphone",
    description: "Pay using your M-Pesa mobile money account"
  },
  {
    id: "cod",
    name: "Cash on Delivery",
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
    case "cash":
      return <CircleDollarSign className="h-5 w-5 text-amber-500" />;
    default:
      return null;
  }
};

const PaymentMethods = ({ 
  selectedPayment, 
  setSelectedPayment 
}: PaymentMethodsProps) => {
  
  return (
    <>
      <RadioGroup 
        value={selectedPayment?.id} 
        onValueChange={(value) => {
          const method = paymentMethods.find(m => m.id === value);
          if (method) setSelectedPayment(method);
        }}
        className="space-y-3"
      >
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            className="flex items-start space-x-2 border rounded-lg p-4 transition-colors hover:bg-accent/50"
          >
            <RadioGroupItem value={method.id} id={method.id} className="mt-1" />
            <div className="flex-1">
              <Label 
                htmlFor={method.id}
                className="flex items-center cursor-pointer"
              >
                <PaymentMethodIcon icon={method.icon} />
                <span className="font-medium ml-2">{method.name}</span>
              </Label>
              
              <p className="text-sm text-muted-foreground mt-1 ml-7">
                {method.description}
              </p>
            </div>
          </div>
        ))}
      </RadioGroup>
      
      <div className="mt-6 flex items-center text-sm text-muted-foreground border rounded-md p-3 bg-muted/50">
        <ShieldCheck className="h-5 w-5 mr-2 text-primary" />
        <p>All payment information is encrypted and securely processed</p>
      </div>
    </>
  );
};

export default PaymentMethods;
