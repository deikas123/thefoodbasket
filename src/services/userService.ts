
import { supabase } from "@/integrations/supabase/client";
import { ProfileType } from "@/types/supabase";

export const getUserProfile = async (userId: string): Promise<ProfileType | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
    
  if (error) {
    if (error.code === 'PGRST116') {
      // Profile not found
      return null;
    }
    console.error("Error fetching user profile:", error);
    throw error;
  }
  
  return data;
};

export const updateUserProfile = async (userId: string, profileData: Partial<ProfileType>): Promise<ProfileType> => {
  const { data, error } = await supabase
    .from('profiles')
    .update(profileData)
    .eq('id', userId)
    .select()
    .single();
    
  if (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
  
  return data;
};

export const getUserRole = async (userId: string): Promise<string | null> => {
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .single();
    
  if (error) {
    if (error.code === 'PGRST116') {
      // Role not found, user is a regular customer
      return 'customer';
    }
    console.error("Error fetching user role:", error);
    throw error;
  }
  
  return data.role;
};

export const getAllUsers = async (): Promise<ProfileType[]> => {
  // Get all profiles
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*');
    
  if (profilesError) {
    console.error("Error fetching profiles:", profilesError);
    throw profilesError;
  }
  
  // Get all roles
  const { data: roles, error: rolesError } = await supabase
    .from('user_roles')
    .select('*');
    
  if (rolesError) {
    console.error("Error fetching roles:", rolesError);
    throw rolesError;
  }
  
  // Combine profiles with roles
  const usersWithRoles = profiles.map(profile => {
    const userRole = roles.find(role => role.user_id === profile.id);
    return {
      ...profile,
      role: userRole ? userRole.role : 'customer'
    };
  });
  
  return usersWithRoles;
};

export const assignUserRole = async (userId: string, role: string): Promise<void> => {
  // Check if user already has a role
  const { data: existingRole, error: fetchError } = await supabase
    .from('user_roles')
    .select('*')
    .eq('user_id', userId);
    
  if (fetchError) {
    console.error("Error checking existing role:", fetchError);
    throw fetchError;
  }
  
  if (existingRole && existingRole.length > 0) {
    // Update existing role
    const { error } = await supabase
      .from('user_roles')
      .update({ role })
      .eq('user_id', userId);
      
    if (error) {
      console.error("Error updating user role:", error);
      throw error;
    }
  } else {
    // Create new role
    const { error } = await supabase
      .from('user_roles')
      .insert([{ user_id: userId, role }]);
      
    if (error) {
      console.error("Error creating user role:", error);
      throw error;
    }
  }
};

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
};

export const updateUserAddress = async (addressId: string, addressData: {
  street?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  is_default?: boolean;
}, userId: string) => {
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
