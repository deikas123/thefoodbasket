
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Lock, CircleDollarSign } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface PayLaterCheckoutOptionProps {
  totalAmount: number;
  onPayLaterSelect: (selected: boolean) => void;
}

const PayLaterCheckoutOption = ({ totalAmount, onPayLaterSelect }: PayLaterCheckoutOptionProps) => {
  const { user } = useAuth();
  const [kycStatus, setKycStatus] = useState<'pending' | 'approved' | 'rejected' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkKYCStatus = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        console.log('Checking KYC status for checkout:', user.id);
        
        const { data, error } = await supabase
          .from('kyc_verifications')
          .select('status')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
          console.error('Error checking KYC status:', error);
        } else if (data) {
          console.log('KYC status for checkout:', data.status);
          setKycStatus(data.status as 'pending' | 'approved' | 'rejected');
        }
      } catch (error) {
        console.error('Unexpected error checking KYC status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkKYCStatus();
  }, [user]);

  const isEnabled = kycStatus === 'approved';

  if (loading) {
    return (
      <Card className="border-gray-200 bg-gray-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-gray-400" />
            Buy Now, Pay Later
          </CardTitle>
          <CardDescription className="text-gray-500">
            Checking verification status...
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

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
            {isEnabled ? "Available" : 
             kycStatus === 'pending' ? "Verification Pending" :
             kycStatus === 'rejected' ? "Verification Required" :
             "Requires Verification"}
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
            {kycStatus === 'pending' 
              ? "Your verification is being reviewed. Please wait for approval."
              : kycStatus === 'rejected'
              ? "Your verification was rejected. Please resubmit your documents."
              : "Complete identity verification to unlock Pay Later options"}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default PayLaterCheckoutOption;
