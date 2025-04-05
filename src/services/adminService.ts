
import { supabase } from "@/integrations/supabase/client";
import { KYCVerification } from "@/types/kyc";

// Get all KYC verifications (for admin)
export const getKYCVerificationsForAdmin = async (): Promise<KYCVerification[]> => {
  try {
    const { data, error } = await supabase
      .from('kyc_verifications')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching KYC verifications:", error);
      return [];
    }
    
    // Map Supabase response to our KYCVerification type
    return data.map(item => ({
      id: item.id,
      userId: item.user_id,
      status: item.status as "pending" | "approved" | "rejected",
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      idDocumentUrl: item.id_document_url || undefined,
      addressProofUrl: item.address_proof_url || undefined,
      adminNotes: item.admin_notes || undefined
    }));
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
    const { error } = await supabase
      .from('kyc_verifications')
      .update({
        status: updates.status,
        admin_notes: updates.adminNotes,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);
    
    if (error) throw error;
  } catch (error) {
    console.error("Error updating KYC verification:", error);
    throw error;
  }
};

// Get admin dashboard stats
export const getAdminDashboardStats = async () => {
  try {
    // Get total number of users
    const { count: userCount, error: userError } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true });
    
    // Get total number of orders
    const { count: orderCount, error: orderError } = await supabase
      .from('orders')
      .select('id', { count: 'exact', head: true });
    
    // Get total number of products
    const { count: productCount, error: productError } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true });
    
    // Get pending KYC verifications count
    const { count: pendingKYCCount, error: kycError } = await supabase
      .from('kyc_verifications')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending');
    
    if (userError || orderError || productError || kycError) {
      console.error("Error fetching admin dashboard stats:", { userError, orderError, productError, kycError });
    }
    
    return {
      userCount: userCount || 0,
      orderCount: orderCount || 0,
      productCount: productCount || 0,
      pendingKYCCount: pendingKYCCount || 0
    };
  } catch (error) {
    console.error("Error fetching admin dashboard stats:", error);
    return {
      userCount: 0,
      orderCount: 0,
      productCount: 0,
      pendingKYCCount: 0
    };
  }
};
