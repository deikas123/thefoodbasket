import { supabase } from "@/integrations/supabase/client";

interface NotifyFlashSaleParams {
  flashSaleId: string;
  flashSaleName: string;
  discountPercentage: number;
  endDate: string;
  productCount: number;
}

export const sendFlashSaleNotification = async (params: NotifyFlashSaleParams): Promise<{
  success: boolean;
  successCount?: number;
  totalRecipients?: number;
  error?: string;
}> => {
  try {
    const { data, error } = await supabase.functions.invoke('flash-sale-notification', {
      body: params,
    });

    if (error) {
      console.error('Error sending flash sale notification:', error);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      successCount: data.successCount,
      totalRecipients: data.totalRecipients,
    };
  } catch (error: any) {
    console.error('Error in sendFlashSaleNotification:', error);
    return { success: false, error: error.message };
  }
};
