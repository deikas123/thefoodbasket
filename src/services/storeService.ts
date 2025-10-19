import { supabase } from "@/integrations/supabase/client";

export interface Store {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  address?: string;
  phone?: string;
  email?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StoreFormData {
  name: string;
  description?: string;
  logo?: string;
  address?: string;
  phone?: string;
  email?: string;
  active: boolean;
}

export const getStores = async (): Promise<Store[]> => {
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const createStore = async (storeData: StoreFormData): Promise<Store> => {
  const { data, error } = await supabase
    .from('stores')
    .insert([storeData])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateStore = async (id: string, storeData: Partial<StoreFormData>): Promise<Store> => {
  const { data, error } = await supabase
    .from('stores')
    .update(storeData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteStore = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('stores')
    .delete()
    .eq('id', id);

  if (error) throw error;
};
