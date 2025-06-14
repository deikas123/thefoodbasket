
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, AlertCircle, ArrowLeft, Home, ShoppingCart, CreditCard } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import KYCVerificationForm from "@/components/payLater/KYCVerificationForm";
import PayLaterOption from "@/components/payLater/PayLaterOption";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const PayLater = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [kycStatus, setKycStatus] = useState<'pending' | 'approved' | 'rejected' | null>(null);

  const handleSubmit = async (formData: { idDocumentUrl: string; addressProofUrl: string }) => {
    console.log('Starting KYC submission:', formData);
    
    if (!user) {
      console.error('No user found');
      toast.error("Please login to continue");
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('Inserting KYC data for user:', user.id);
      
      // Submit KYC verification to Supabase
      const { data, error } = await supabase
        .from('kyc_verifications')
        .insert([{
          user_id: user.id,
          id_document_url: formData.idDocumentUrl,
          address_proof_url: formData.addressProofUrl,
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
      console.error('Unexpected error during KYC submission:', error);
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
        {/* Navigation Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          
          <div className="flex items-center gap-2">
            <Link to="/">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Home
              </Button>
            </Link>
            <Link to="/shop">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Shop
              </Button>
            </Link>
          </div>
        </div>

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

        {/* Bottom Navigation */}
        <div className="flex justify-center mt-8 pt-8 border-t">
          <div className="flex items-center gap-4">
            <Link to="/orders">
              <Button variant="outline" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                My Orders
              </Button>
            </Link>
            <Link to="/wallet">
              <Button variant="outline" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                My Wallet
              </Button>
            </Link>
            <Link to="/profile">
              <Button variant="outline">
                My Profile
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayLater;
