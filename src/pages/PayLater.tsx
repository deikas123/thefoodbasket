
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";
import KYCVerificationForm from "@/components/payLater/KYCVerificationForm";
import PayLaterOption from "@/components/payLater/PayLaterOption";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const PayLater = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [kycStatus, setKycStatus] = useState<'pending' | 'approved' | 'rejected' | null>(null);

  const handleSubmit = async (formData: any) => {
    if (!user) {
      toast.error("Please login to continue");
      return;
    }

    setIsLoading(true);
    
    try {
      // Submit KYC verification to Supabase
      const { data, error } = await supabase
        .from('kyc_verifications')
        .insert([{
          user_id: user.id,
          id_document_url: formData.idDocument,
          address_proof_url: formData.addressProof,
          status: 'pending'
        }])
        .select()
        .single();

      if (error) {
        console.error('KYC submission error:', error);
        toast.error("Failed to submit verification. Please try again.");
        return;
      }

      console.log('KYC submitted successfully:', data);
      setKycStatus('pending');
      toast.success("KYC verification submitted successfully! We'll review your documents within 24-48 hours.");
      
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Login Required</CardTitle>
            <CardDescription>
              Please login to access Pay Later options
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Pay Later Options</h1>
          <p className="text-muted-foreground">
            Shop now and pay later with our flexible payment options
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* KYC Verification Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {kycStatus === 'pending' && <Clock className="h-5 w-5 text-yellow-500" />}
                {kycStatus === 'approved' && <CheckCircle className="h-5 w-5 text-green-500" />}
                {kycStatus === 'rejected' && <AlertCircle className="h-5 w-5 text-red-500" />}
                KYC Verification
              </CardTitle>
              <CardDescription>
                Complete your verification to unlock Pay Later options
              </CardDescription>
            </CardHeader>
            <CardContent>
              {kycStatus === 'pending' && (
                <div className="text-center p-4">
                  <Clock className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Verification Pending</h3>
                  <p className="text-sm text-muted-foreground">
                    Your documents are being reviewed. This usually takes 24-48 hours.
                  </p>
                </div>
              )}
              
              {kycStatus === 'approved' && (
                <div className="text-center p-4">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Verification Approved</h3>
                  <p className="text-sm text-muted-foreground">
                    You can now use Pay Later options for your purchases.
                  </p>
                </div>
              )}
              
              {kycStatus === 'rejected' && (
                <div className="text-center p-4">
                  <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Verification Rejected</h3>
                  <p className="text-sm text-muted-foreground">
                    Please contact support or resubmit with correct documents.
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setKycStatus(null)}
                  >
                    Try Again
                  </Button>
                </div>
              )}
              
              {!kycStatus && (
                <KYCVerificationForm 
                  onSubmit={handleSubmit}
                  isLoading={isLoading}
                />
              )}
            </CardContent>
          </Card>

          {/* Pay Later Options */}
          <div className="space-y-6">
            <PayLaterOption
              title="Buy Now, Pay in 30 Days"
              description="Get your groceries today and pay in full after 30 days with no interest."
              features={["No interest charges", "30-day payment window", "Automatic reminders"]}
              isEnabled={kycStatus === 'approved'}
            />
            
            <PayLaterOption
              title="Split Payment Plan"
              description="Split your purchase into 3 equal installments over 60 days."
              features={["3 equal payments", "60-day payment period", "Small convenience fee"]}
              isEnabled={kycStatus === 'approved'}
            />
            
            <PayLaterOption
              title="Monthly Payment Plan"
              description="Pay for larger orders in monthly installments up to 6 months."
              features={["Up to 6 months", "Fixed monthly payments", "Competitive interest rates"]}
              isEnabled={kycStatus === 'approved'}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayLater;
