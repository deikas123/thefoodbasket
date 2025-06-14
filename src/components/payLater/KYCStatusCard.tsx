
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";
import KYCVerificationForm from "./KYCVerificationForm";
import DataPrivacyNotice from "./DataPrivacyNotice";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface KYCStatusCardProps {
  kycStatus: 'pending' | 'approved' | 'rejected' | null;
  setKycStatus: (status: 'pending' | 'approved' | 'rejected' | null) => void;
  checkingStatus: boolean;
}

const KYCStatusCard = ({ kycStatus, setKycStatus, checkingStatus }: KYCStatusCardProps) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  const handleSubmit = async (formData: { idDocumentUrl: string; addressProofUrl: string }) => {
    console.log('Starting KYC submission:', formData);
    
    if (!user) {
      console.error('No user found');
      toast.error("Please login to continue");
      return;
    }

    // Validate that both URLs are provided and not empty
    if (!formData.idDocumentUrl || !formData.addressProofUrl || 
        formData.idDocumentUrl.trim() === '' || formData.addressProofUrl.trim() === '') {
      toast.error("Both documents must be uploaded before submission");
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('Inserting KYC data for user:', user.id);
      
      // Submit KYC verification to Supabase
      const { data, error } = await supabase
        .from('kyc_verifications')
        .upsert([{
          user_id: user.id,
          id_document_url: formData.idDocumentUrl,
          address_proof_url: formData.addressProofUrl,
          status: 'pending'
        }], {
          onConflict: 'user_id'
        })
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

  const handlePrivacyAccept = () => {
    setPrivacyAccepted(true);
  };

  const renderStatusContent = () => {
    if (checkingStatus) {
      return (
        <div className="text-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Checking verification status...</p>
        </div>
      );
    }

    if (kycStatus === 'pending') {
      return (
        <div className="text-center p-4">
          <Clock className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="font-semibold mb-2">Verification Pending</h3>
          <p className="text-sm text-muted-foreground">
            Your documents are being reviewed. This usually takes 24-48 hours.
          </p>
        </div>
      );
    }

    if (kycStatus === 'approved') {
      return (
        <div className="text-center p-4">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="font-semibold mb-2">Verification Approved</h3>
          <p className="text-sm text-muted-foreground">
            You can now use Pay Later options for your purchases.
          </p>
        </div>
      );
    }

    if (kycStatus === 'rejected') {
      return (
        <div className="text-center p-4">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="font-semibold mb-2">Verification Rejected</h3>
          <p className="text-sm text-muted-foreground">
            Please contact support or resubmit with correct documents.
          </p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => {
              setKycStatus(null);
              setPrivacyAccepted(false);
            }}
          >
            Try Again
          </Button>
        </div>
      );
    }

    if (!privacyAccepted) {
      return <DataPrivacyNotice onAccept={handlePrivacyAccept} />;
    }

    return (
      <KYCVerificationForm 
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    );
  };

  return (
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
        {renderStatusContent()}
      </CardContent>
    </Card>
  );
};

export default KYCStatusCard;
