
import { useState, useEffect } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CalendarClock, Clock } from "lucide-react";
import { isEligibleForPayLater } from "@/services/kycService";
import { addDays, format } from "date-fns";

interface PayLaterOptionProps {
  totalAmount: number;
  onPayLaterSelect: (selected: boolean) => void;
}

const PayLaterOption = ({ totalAmount, onPayLaterSelect }: PayLaterOptionProps) => {
  const [isEligible, setIsEligible] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [usePayLater, setUsePayLater] = useState(false);
  
  const dueDate = addDays(new Date(), 30);

  useEffect(() => {
    const checkEligibility = async () => {
      setIsLoading(true);
      try {
        const eligible = await isEligibleForPayLater();
        setIsEligible(eligible);
      } catch (error) {
        console.error("Error checking pay later eligibility:", error);
        setIsEligible(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkEligibility();
  }, []);
  
  const handlePayLaterToggle = (value: string) => {
    const selected = value === "paylater";
    setUsePayLater(selected);
    onPayLaterSelect(selected);
  };

  return (
    <RadioGroup className="space-y-3" onValueChange={handlePayLaterToggle} value={usePayLater ? "paylater" : "regular"}>
      <div
        className={`flex items-start space-x-2 border rounded-lg p-4 transition-colors hover:bg-accent/50 ${usePayLater ? 'border-primary bg-accent/30' : ''}`}
      >
        <RadioGroupItem value="paylater" id="paylater" className="mt-1" disabled={isLoading || !isEligible} />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <Label 
              htmlFor="paylater"
              className="flex items-center cursor-pointer"
            >
              <CalendarClock className="h-5 w-5 text-primary mr-2" />
              <span className="font-medium">Buy Now, Pay Later</span>
            </Label>
            
            <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-600 border-blue-200">
              30 Days
            </Badge>
          </div>
          
          {isLoading ? (
            <div className="animate-pulse h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mt-1 ml-7"></div>
          ) : isEligible ? (
            <div className="text-sm mt-1 ml-7">
              <p className="text-muted-foreground">
                Pay ${totalAmount.toFixed(2)} by {format(dueDate, 'MMMM d, yyyy')}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                <Clock size={12} className="inline mr-1" />
                No interest or fees if paid within 30 days
              </p>
            </div>
          ) : (
            <div className="text-sm mt-1 ml-7 flex items-center text-amber-600">
              <AlertCircle size={14} className="mr-1" />
              <p>
                {isEligible === false 
                  ? "You need to complete identity verification to use this option" 
                  : "Unable to check eligibility"
                }
              </p>
            </div>
          )}
        </div>
      </div>
      
      <div
        className={`flex items-start space-x-2 border rounded-lg p-4 transition-colors hover:bg-accent/50 ${!usePayLater ? 'border-primary bg-accent/30' : ''}`}
      >
        <RadioGroupItem value="regular" id="regular" className="mt-1" />
        <div className="flex-1">
          <Label 
            htmlFor="regular"
            className="flex items-center cursor-pointer"
          >
            <span className="font-medium">Pay Now</span>
          </Label>
          <p className="text-sm text-muted-foreground mt-1">Pay the full amount immediately</p>
        </div>
      </div>
    </RadioGroup>
  );
};

export default PayLaterOption;
