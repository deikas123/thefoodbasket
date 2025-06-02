
import { supabase } from "@/integrations/supabase/client";

export interface DeliveryOption {
  id: string;
  name: string;
  description?: string;
  base_price: number;
  price_per_km?: number;
  estimated_delivery_days: number;
  is_express: boolean;
  active: boolean;
}

export const getActiveDeliveryOptions = async (): Promise<DeliveryOption[]> => {
  const { data, error } = await supabase
    .from('delivery_options')
    .select('*')
    .eq('active', true)
    .order('is_express', { ascending: true });
    
  if (error) {
    console.error('Error fetching delivery options:', error);
    throw error;
  }
  
  return data || [];
};

export const createDeliveryOption = async (option: Omit<DeliveryOption, 'id'>): Promise<DeliveryOption> => {
  const { data, error } = await supabase
    .from('delivery_options')
    .insert(option)
    .select()
    .single();
    
  if (error) {
    console.error('Error creating delivery option:', error);
    throw error;
  }
  
  return data;
};

export const updateDeliveryOption = async (id: string, updates: Partial<DeliveryOption>): Promise<DeliveryOption> => {
  const { data, error } = await supabase
    .from('delivery_options')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    console.error('Error updating delivery option:', error);
    throw error;
  }
  
  return data;
};

export const deleteDeliveryOption = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('delivery_options')
    .delete()
    .eq('id', id);
    
  if (error) {
    console.error('Error deleting delivery option:', error);
    throw error;
  }
};
