
import { supabase } from "@/integrations/supabase/client";
import { KYCVerification } from "@/types/kyc";
import { toast } from "@/hooks/use-toast";
import { Database } from "@/types/database.types";

// Get user KYC verification status
export const getUserKYCStatus = async (): Promise<KYCVerification | null> => {
  const { data, error } = await supabase
    .from("kyc_verifications")
    .select("*")
    .single();
  
  if (error && error.code !== 'PGRST116') { // Not found error
    console.error("Error fetching KYC status:", error);
  }
  
  if (!data) return null;

  // Map database response to KYCVerification type
  const kyc = data as Database['public']['Tables']['kyc_verifications']['Row'];
  return {
    id: kyc.id,
    userId: kyc.user_id,
    idDocumentUrl: kyc.id_document_url || undefined,
    addressProofUrl: kyc.address_proof_url || undefined,
    status: kyc.status as "pending" | "approved" | "rejected",
    adminNotes: kyc.admin_notes || undefined,
    createdAt: kyc.created_at,
    updatedAt: kyc.updated_at
  };
};

// Submit KYC verification
export const submitKYCVerification = async (
  idDocumentUrl: string,
  addressProofUrl: string
): Promise<boolean> => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return false;
  
  // Check if KYC already exists
  const existingKYC = await getUserKYCStatus();
  
  if (existingKYC) {
    // Update existing KYC
    const { error } = await supabase
      .from("kyc_verifications")
      .update({
        id_document_url: idDocumentUrl,
        address_proof_url: addressProofUrl,
        status: "pending",
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingKYC.id);
    
    if (error) {
      console.error("Error updating KYC verification:", error);
      toast({
        title: "Failed to submit verification",
        description: "Please try again later",
        variant: "destructive",
      });
      return false;
    }
  } else {
    // Create new KYC
    const { error } = await supabase
      .from("kyc_verifications")
      .insert({
        user_id: user.user.id,
        id_document_url: idDocumentUrl,
        address_proof_url: addressProofUrl,
        status: "pending",
      });
    
    if (error) {
      console.error("Error submitting KYC verification:", error);
      toast({
        title: "Failed to submit verification",
        description: "Please try again later",
        variant: "destructive",
      });
      return false;
    }
  }
  
  toast({
    title: "Verification submitted",
    description: "Your identity verification is under review",
  });
  
  return true;
};

// Check if user is eligible for pay later
export const isEligibleForPayLater = async (): Promise<boolean> => {
  const kycStatus = await getUserKYCStatus();
  return kycStatus?.status === "approved";
};
