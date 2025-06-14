
import { supabase } from "@/integrations/supabase/client";
import { KYCVerification } from "@/types/kyc";
import { toast } from "@/components/ui/use-toast";

// Get KYC verifications for admin review
export const getKYCVerificationsForAdmin = async (): Promise<KYCVerification[]> => {
  try {
    const { data, error } = await supabase
      .from('kyc_verifications')
      .select(`
        *,
        profile:user_id (
          first_name,
          last_name,
          phone
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching KYC verifications:", error);
      throw error;
    }

    return (data || []).map(item => ({
      id: item.id,
      userId: item.user_id,
      idDocumentUrl: item.id_document_url || undefined,
      addressProofUrl: item.address_proof_url || undefined,
      status: item.status as "pending" | "approved" | "rejected",
      adminNotes: item.admin_notes || undefined,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      userDetails: item.profile ? {
        firstName: item.profile.first_name,
        lastName: item.profile.last_name,
        phone: item.profile.phone
      } : undefined
    }));
  } catch (error) {
    console.error("Error in getKYCVerificationsForAdmin:", error);
    return [];
  }
};

// Update KYC verification status
export const updateKYCVerification = async (
  id: string,
  updateData: {
    status: "approved" | "rejected";
    adminNotes?: string;
  }
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('kyc_verifications')
      .update({
        status: updateData.status,
        admin_notes: updateData.adminNotes,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error("Error updating KYC verification:", error);
      toast({
        title: "Error",
        description: "Failed to update verification status: " + error.message,
        variant: "destructive",
      });
      return false;
    }

    toast({
      title: "Success",
      description: `Verification ${updateData.status} successfully!`,
    });

    return true;
  } catch (error) {
    console.error("Error in updateKYCVerification:", error);
    return false;
  }
};
