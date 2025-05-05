
import { supabase } from "@/integrations/supabase/client";
import { Address } from "@/types";

export const getUserAddresses = async (userId: string) => {
  const { data, error } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', userId)
    .order('is_default', { ascending: false });
    
  if (error) {
    console.error("Error fetching addresses:", error);
    throw error;
  }
  
  return data || [];
};

export const addUserAddress = async (userId: string, addressData: {
  street: string;
  city: string;
  state: string;
  zip_code: string;
  is_default: boolean;
}) => {
  try {
    // If this is the default address, unset other defaults
    if (addressData.is_default) {
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', userId);
    }
    
    // Add new address
    const { data, error } = await supabase
      .from('addresses')
      .insert([{ user_id: userId, ...addressData }])
      .select()
      .single();
      
    if (error) {
      console.error("Error adding address:", error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error("Error in addUserAddress:", error);
    throw error;
  }
};

export const updateUserAddress = async (addressId: string, addressData: {
  street?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  is_default?: boolean;
}, userId: string) => {
  try {
    // If this is being set as default, unset other defaults
    if (addressData.is_default) {
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', userId);
    }
    
    // Update address
    const { data, error } = await supabase
      .from('addresses')
      .update(addressData)
      .eq('id', addressId)
      .select()
      .single();
      
    if (error) {
      console.error("Error updating address:", error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error("Error in updateUserAddress:", error);
    throw error;
  }
};

export const deleteUserAddress = async (addressId: string) => {
  const { error } = await supabase
    .from('addresses')
    .delete()
    .eq('id', addressId);
    
  if (error) {
    console.error("Error deleting address:", error);
    throw error;
  }
};

// Convert database addresses to app format
export const formatAddressFromDb = (dbAddress: any): Address => ({
  id: dbAddress.id,
  street: dbAddress.street,
  city: dbAddress.city,
  state: dbAddress.state,
  zipCode: dbAddress.zip_code,
  isDefault: dbAddress.is_default
});
