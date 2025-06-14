
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Lock, CircleDollarSign } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface PayLaterCheckoutOptionProps {
  totalAmount: number;
  onPayLaterSelect: (selected: boolean) => void;
}

const PayLaterCheckoutOption = ({ totalAmount, onPayLaterSelect }: PayLaterCheckoutOptionProps) => {
  // For now, we'll assume pay later is not enabled since we don't have KYC status here
  // In a real implementation, you'd pass the KYC status or fetch it
  const isEnabled = false;

  return (
    <Card className={`${isEnabled ? 'border-blue-500 bg-blue-50/50' : 'border-gray-200 bg-gray-50/50'}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {isEnabled ? (
              <CircleDollarSign className="h-5 w-5 text-blue-500" />
            ) : (
              <Lock className="h-5 w-5 text-gray-400" />
            )}
            Buy Now, Pay Later
          </CardTitle>
          <Badge variant={isEnabled ? "default" : "secondary"}>
            {isEnabled ? "Available" : "Requires Verification"}
          </Badge>
        </div>
        <CardDescription className={isEnabled ? "text-gray-700" : "text-gray-500"}>
          Pay within 30 days with no interest (KSh {totalAmount.toLocaleString()})
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="paylater-option"
            disabled={!isEnabled}
            onCheckedChange={onPayLaterSelect}
          />
          <label 
            htmlFor="paylater-option" 
            className={`text-sm ${isEnabled ? 'text-gray-700' : 'text-gray-500'}`}
          >
            Use Pay Later for this order
          </label>
        </div>
        {!isEnabled && (
          <p className="text-xs text-gray-500 mt-2">
            Complete identity verification to unlock Pay Later options
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default PayLaterCheckoutOption;
