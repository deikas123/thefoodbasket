import { PaymentMethod } from "@/types";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  Smartphone, 
  CircleDollarSign, 
  Wallet,
  BanknoteIcon,
  Check
} from "lucide-react";
import WalletPaymentOption from "@/components/wallet/WalletPaymentOption";
import PayLaterCheckoutOption from "@/components/checkout/PayLaterCheckoutOption";

interface PaymentMethodsProps {
  selectedPayment: PaymentMethod | null;
  setSelectedPayment: (method: PaymentMethod) => void;
  orderTotal: number;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: "mpesa",
    name: "M-Pesa",
    type: "mpesa",
    icon: "smartphone",
    description: "Pay with M-Pesa STK Push"
  },
  {
    id: "cod",
    name: "Cash on Delivery",
    type: "cod",
    icon: "cash",
    description: "Pay when your order arrives"
  },
  {
    id: "card",
    name: "Card Payment",
    type: "card",
    icon: "credit-card",
    description: "Visa, Mastercard (Coming Soon)"
  },
];

const PaymentMethodIcon = ({ icon, className = "" }: { icon: string; className?: string }) => {
  const base = `h-5 w-5 ${className}`;
  switch (icon) {
    case "credit-card": return <CreditCard className={`${base} text-primary`} />;
    case "smartphone": return <Smartphone className={`${base} text-green-600`} />;
    case "wallet": return <Wallet className={`${base} text-purple-600`} />;
    case "calendar": return <CircleDollarSign className={`${base} text-blue-600`} />;
    case "cash": return <BanknoteIcon className={`${base} text-amber-500`} />;
    default: return null;
  }
};

const PaymentMethods = ({ 
  selectedPayment, 
  setSelectedPayment,
  orderTotal
}: PaymentMethodsProps) => {
  const handleWalletSelect = (selected: boolean) => {
    if (selected) {
      setSelectedPayment({ id: "wallet", name: "E-Wallet", type: "wallet", icon: "wallet" });
    } else {
      setSelectedPayment(paymentMethods[0]);
    }
  };
  
  const handlePayLaterSelect = (selected: boolean) => {
    if (selected) {
      setSelectedPayment({ id: "paylater", name: "Buy Now, Pay Later", type: "paylater", icon: "calendar" });
    } else {
      setSelectedPayment(paymentMethods[0]);
    }
  };
  
  return (
    <div className="space-y-3">
      {/* Main payment methods as tappable cards */}
      <div className="grid grid-cols-1 gap-2">
        {paymentMethods.map((method) => {
          const isSelected = selectedPayment?.id === method.id;
          return (
            <button
              key={method.id}
              type="button"
              onClick={() => setSelectedPayment(method)}
              className={`flex items-center gap-3 p-3 sm:p-4 rounded-xl border-2 transition-all text-left w-full
                ${isSelected 
                  ? 'border-primary bg-primary/5 shadow-sm' 
                  : 'border-border hover:border-primary/40 hover:bg-accent/30'
                }
                ${method.id === 'card' ? 'opacity-60' : ''}
              `}
              disabled={method.id === 'card'}
            >
              <div className={`p-2 rounded-lg shrink-0 ${
                isSelected ? 'bg-primary/10' : 'bg-muted'
              }`}>
                <PaymentMethodIcon icon={method.icon} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm sm:text-base">{method.name}</span>
                  {method.id === "mpesa" && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-green-50 text-green-600 border-green-200 dark:bg-green-950 dark:text-green-400">
                      Popular
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  {method.description}
                </p>
              </div>
              
              {isSelected && (
                <div className="shrink-0 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="h-3 w-3 text-primary-foreground" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Wallet & Pay Later as compact options */}
      <div className="space-y-2 pt-2 border-t">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">More Options</p>
        <WalletPaymentOption 
          totalAmount={orderTotal}
          onWalletSelect={handleWalletSelect}
        />
        <PayLaterCheckoutOption 
          totalAmount={orderTotal}
          onPayLaterSelect={handlePayLaterSelect}
        />
      </div>
    </div>
  );
};

export default PaymentMethods;
