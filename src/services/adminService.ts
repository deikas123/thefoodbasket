
import { supabase } from "@/integrations/supabase/client";
import { KYCVerification } from "@/types/kyc";
import { toast } from "@/components/ui/use-toast";
import { Tables } from "@/types/supabase";

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

// Get statistics for admin dashboard
export interface AdminStats {
  revenueToday: number;
  revenueThisMonth: number;
  revenueLastMonth: number;
  ordersToday: number;
  ordersThisMonth: number;
  pendingOrders: number;
  newCustomers: number;
  activeCustomers: number;
  topSellingProducts: {
    id: string;
    name: string;
    quantity: number;
    revenue: number;
  }[];
  categorySales: {
    name: string;
    value: number;
  }[];
  monthlyRevenue: {
    month: string;
    value: number;
  }[];
  orderStatuses: {
    status: string;
    count: number;
  }[];
}

export const getAdminDashboardStats = async (): Promise<AdminStats> => {
  // For now, return mock data until we implement the actual queries
  return {
    revenueToday: 12500,
    revenueThisMonth: 243500,
    revenueLastMonth: 190000,
    ordersToday: 18,
    ordersThisMonth: 211,
    pendingOrders: 24,
    newCustomers: 56,
    activeCustomers: 328,
    topSellingProducts: [
      { id: "1", name: "Fresh Tomatoes", quantity: 245, revenue: 24500 },
      { id: "2", name: "Organic Bananas", quantity: 189, revenue: 18900 },
      { id: "3", name: "Free Range Eggs", quantity: 156, revenue: 15600 },
    ],
    categorySales: [
      { name: 'Fruits', value: 35 },
      { name: 'Vegetables', value: 30 },
      { name: 'Dairy', value: 15 },
      { name: 'Meat', value: 12 },
      { name: 'Bakery', value: 8 },
    ],
    monthlyRevenue: [
      { month: 'Jan', value: 125000 },
      { month: 'Feb', value: 140000 },
      { month: 'Mar', value: 135000 },
      { month: 'Apr', value: 160000 },
      { month: 'May', value: 190000 },
      { month: 'Jun', value: 243500 },
    ],
    orderStatuses: [
      { status: 'Pending', count: 24 },
      { status: 'Processing', count: 18 },
      { status: 'Dispatched', count: 12 },
      { status: 'Out for Delivery', count: 16 },
      { status: 'Delivered', count: 187 },
      { status: 'Cancelled', count: 8 },
    ]
  };
};
