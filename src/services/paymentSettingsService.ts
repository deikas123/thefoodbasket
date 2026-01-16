import { supabase } from "@/integrations/supabase/client";

export interface PaymentSetting {
  id: string;
  payment_method: string;
  display_name: string;
  description: string | null;
  icon: string | null;
  enabled: boolean;
  sort_order: number;
  min_amount: number;
  max_amount: number | null;
  processing_fee_percentage: number;
  processing_fee_fixed: number;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export const getPaymentSettings = async (): Promise<PaymentSetting[]> => {
  const { data, error } = await supabase
    .from('payment_settings')
    .select('*')
    .order('sort_order');
    
  if (error) {
    console.error('Error fetching payment settings:', error);
    return [];
  }
  
  return data || [];
};

export const getEnabledPaymentMethods = async (): Promise<PaymentSetting[]> => {
  const { data, error } = await supabase
    .from('payment_settings')
    .select('*')
    .eq('enabled', true)
    .order('sort_order');
    
  if (error) {
    console.error('Error fetching enabled payment methods:', error);
    return [];
  }
  
  return data || [];
};

export const updatePaymentSetting = async (
  id: string, 
  updates: Partial<PaymentSetting>
): Promise<boolean> => {
  const { error } = await supabase
    .from('payment_settings')
    .update(updates)
    .eq('id', id);
    
  if (error) {
    console.error('Error updating payment setting:', error);
    return false;
  }
  
  return true;
};

export const togglePaymentMethod = async (
  id: string, 
  enabled: boolean
): Promise<boolean> => {
  return updatePaymentSetting(id, { enabled });
};
