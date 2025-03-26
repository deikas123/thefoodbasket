
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Tag, CheckCircle2, XCircle } from "lucide-react";

interface PromoCodeInputProps {
  onApplyPromo: (discount: number) => void;
}

// Mock promo codes for demonstration
const VALID_PROMO_CODES = {
  "WELCOME10": { discount: 10, type: "percentage" },
  "FRESH20": { discount: 20, type: "percentage" },
  "FREE5": { discount: 5, type: "fixed" }
};

const PromoCodeInput = ({ onApplyPromo }: PromoCodeInputProps) => {
  const [promoCode, setPromoCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const handleApplyPromo = () => {
    if (!promoCode.trim()) {
      setError("Please enter a promo code");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    // Simulate API call
    setTimeout(() => {
      const normalizedCode = promoCode.trim().toUpperCase();
      const promoInfo = (VALID_PROMO_CODES as any)[normalizedCode];
      
      if (promoInfo) {
        // Valid promo code
        setAppliedCode(normalizedCode);
        
        // Calculate discount amount
        const discountAmount = promoInfo.type === "percentage" 
          ? promoInfo.discount
          : promoInfo.discount;
        
        onApplyPromo(discountAmount);
        
        toast({
          title: "Promo code applied!",
          description: `${promoInfo.type === "percentage" 
            ? `${promoInfo.discount}% discount` 
            : `$${promoInfo.discount} discount`} has been applied to your order.`,
        });
      } else {
        // Invalid promo code
        setError("Invalid or expired promo code");
        onApplyPromo(0); // Reset any previously applied discount
        
        toast({
          title: "Invalid promo code",
          description: "The promo code you entered is invalid or has expired.",
          variant: "destructive",
        });
      }
      
      setIsLoading(false);
    }, 800);
  };
  
  const handleRemovePromo = () => {
    setAppliedCode(null);
    setPromoCode("");
    onApplyPromo(0);
    
    toast({
      title: "Promo code removed",
      description: "The discount has been removed from your order.",
    });
  };
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Have a promo code?</h3>
        
        {appliedCode && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleRemovePromo}
            className="h-auto p-0 text-sm text-red-500 hover:text-red-600"
          >
            Remove
          </Button>
        )}
      </div>
      
      {!appliedCode ? (
        <div className="flex space-x-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Tag className="h-4 w-4 text-muted-foreground" />
            </div>
            <Input
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              placeholder="Enter promo code"
              className="pl-10"
            />
          </div>
          <Button 
            onClick={handleApplyPromo} 
            disabled={isLoading}
            size="sm"
          >
            Apply
          </Button>
        </div>
      ) : (
        <div className="flex items-center p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900 rounded-md">
          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 mr-2" />
          <span className="text-sm font-medium text-green-800 dark:text-green-200">
            {appliedCode} applied
          </span>
        </div>
      )}
      
      {error && (
        <div className="flex items-center text-sm text-red-600">
          <XCircle className="h-4 w-4 mr-1" />
          {error}
        </div>
      )}
    </div>
  );
};

export default PromoCodeInput;
