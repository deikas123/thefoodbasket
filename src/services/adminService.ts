
import { supabase } from "@/integrations/supabase/client";
import { KYCVerification } from "@/types/kyc";

// Mock data for KYC verifications (in a real app this would come from Supabase)
const mockKYCVerifications: KYCVerification[] = [
  {
    id: "1",
    userId: "user-123",
    status: "pending",
    createdAt: "2024-03-01T10:00:00Z",
    updatedAt: "2024-03-01T10:00:00Z",
    idDocumentUrl: "https://placehold.co/600x400?text=ID+Document",
    addressProofUrl: "https://placehold.co/600x400?text=Address+Proof"
  },
  {
    id: "2",
    userId: "user-456",
    status: "approved",
    createdAt: "2024-03-02T14:30:00Z",
    updatedAt: "2024-03-03T09:15:00Z",
    idDocumentUrl: "https://placehold.co/600x400?text=ID+Document",
    addressProofUrl: "https://placehold.co/600x400?text=Address+Proof",
    adminNotes: "Documents verified successfully."
  },
  {
    id: "3",
    userId: "user-789",
    status: "rejected",
    createdAt: "2024-03-04T11:45:00Z",
    updatedAt: "2024-03-04T16:20:00Z",
    idDocumentUrl: "https://placehold.co/600x400?text=ID+Document",
    addressProofUrl: "https://placehold.co/600x400?text=Address+Proof",
    adminNotes: "Address proof doesn't match the provided information."
  }
];

// Get all KYC verifications (for admin)
export const getKYCVerificationsForAdmin = async (): Promise<KYCVerification[]> => {
  try {
    // In a real implementation, you would fetch from Supabase
    // const { data, error } = await supabase
    //   .from('kyc_verifications')
    //   .select('*')
    //   .order('created_at', { ascending: false });
    
    // if (error) throw error;
    // return data as KYCVerification[];
    
    // For now, return mock data
    return mockKYCVerifications;
  } catch (error) {
    console.error("Error fetching KYC verifications:", error);
    return [];
  }
};

// Update a KYC verification status
export const updateKYCVerification = async (
  id: string,
  updates: { status: "approved" | "rejected"; adminNotes?: string }
): Promise<void> => {
  try {
    // In a real implementation, you would update in Supabase
    // const { error } = await supabase
    //   .from('kyc_verifications')
    //   .update({
    //     status: updates.status,
    //     admin_notes: updates.adminNotes,
    //     updated_at: new Date().toISOString()
    //   })
    //   .eq('id', id);
    
    // if (error) throw error;
    
    // For now, we'll just update the mock data
    const index = mockKYCVerifications.findIndex(v => v.id === id);
    if (index !== -1) {
      mockKYCVerifications[index] = {
        ...mockKYCVerifications[index],
        status: updates.status,
        adminNotes: updates.adminNotes,
        updatedAt: new Date().toISOString()
      };
    }
  } catch (error) {
    console.error("Error updating KYC verification:", error);
    throw error;
  }
};

// Add more admin-specific functions here as we implement them
