
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Tag, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { validateDiscountCode, applyDiscountCode, DiscountCode } from "@/services/discountService";
import { formatCurrency } from "@/utils/currencyFormatter";

interface PromoCodeInputProps {
  onApplyPromo: (discount: number, code?: DiscountCode) => void;
  purchaseAmount: number;
}

const PromoCodeInput = ({ onApplyPromo, purchaseAmount }: PromoCodeInputProps) => {
  const [promoCode, setPromoCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [appliedCode, setAppliedCode] = useState<DiscountCode | null>(null);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  
  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      setError("Please enter a promo code");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await validateDiscountCode(promoCode.trim().toUpperCase(), purchaseAmount);
      
      if (result.valid && result.discountCode && result.discountAmount) {
        setAppliedCode(result.discountCode);
        setDiscountAmount(result.discountAmount);
        onApplyPromo(result.discountAmount, result.discountCode);
        
        toast({
          title: "Promo code applied!",
          description: `You saved ${formatCurrency(result.discountAmount)}!`,
        });
      } else {
        setError(result.message || "Invalid promo code");
        onApplyPromo(0);
        
        toast({
          title: "Invalid promo code",
          description: result.message || "The promo code you entered is invalid.",
          variant: "destructive",
        });
      }
    } catch (err) {
      setError("Error validating promo code");
      toast({
        title: "Error",
        description: "Could not validate promo code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRemovePromo = () => {
    setAppliedCode(null);
    setDiscountAmount(0);
    setPromoCode("");
    onApplyPromo(0);
    
    toast({
      title: "Promo code removed",
      description: "The discount has been removed from your order.",
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleApplyPromo();
    }
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
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              onKeyDown={handleKeyDown}
              placeholder="Enter promo code"
              className="pl-10 uppercase"
              disabled={isLoading}
            />
          </div>
          <Button 
            onClick={handleApplyPromo} 
            disabled={isLoading || !promoCode.trim()}
            size="sm"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Apply"
            )}
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900 rounded-md">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            <div>
              <span className="text-sm font-medium text-green-800 dark:text-green-200">
                {appliedCode.code}
              </span>
              <p className="text-xs text-green-600 dark:text-green-400">
                {appliedCode.type === 'percentage' 
                  ? `${appliedCode.value}% off` 
                  : `${formatCurrency(appliedCode.value)} off`}
              </p>
            </div>
          </div>
          <span className="text-sm font-bold text-green-700 dark:text-green-300">
            -{formatCurrency(discountAmount)}
          </span>
        </div>
      )}
      
      {error && (
        <div className="flex items-center text-sm text-red-600 dark:text-red-400">
          <XCircle className="h-4 w-4 mr-1" />
          {error}
        </div>
      )}
    </div>
  );
};

export default PromoCodeInput;
