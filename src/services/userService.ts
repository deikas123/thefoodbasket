import { supabase } from "@/integrations/supabase/client";
import { ProfileType, UserRole } from "@/types/supabase";
import { User } from "@/types";

export const getUserById = async (userId: string): Promise<User | null> => {
  try {
    // Get the user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (profileError) {
      console.error("Error fetching profile:", profileError);
      return null;
    }
    
    // Get the user role
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();
      
    // Use a default role if none is found or there's an error
    const role = !roleError && roleData ? (roleData.role as UserRole) : 'customer';

    // Get user's addresses
    const { data: addresses, error: addressesError } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userId);
      
    if (addressesError) {
      console.error("Error fetching addresses:", addressesError);
    }
    
    // Convert profile to User type
    const user: User = {
      id: profile.id,
      email: `${profile.id}@example.com`, // Placeholder since we don't have this in profiles
      firstName: profile.first_name || '',
      lastName: profile.last_name || '',
      role: role as UserRole,
      addresses: addresses ? addresses.map(addr => ({
        id: addr.id,
        street: addr.street,
        city: addr.city,
        state: addr.state,
        zipCode: addr.zip_code,
        isDefault: addr.is_default
      })) : [],
      loyaltyPoints: profile.loyalty_points || 0,
      createdAt: profile.created_at,
      phone: profile.phone || undefined,
      dietaryPreferences: profile.dietary_preferences || []
    };
    
    return user;
  } catch (error) {
    console.error("Error in getUserById:", error);
    return null;
  }
};

export const getAllUsers = async (): Promise<User[]> => {
  try {
    // Get all profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*');
      
    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      return [];
    }
    
    // Get all roles
    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('*');
      
    if (rolesError) {
      console.error("Error fetching roles:", rolesError);
    }
    
    // Create a map of roles by user_id for quick lookup
    const roleMap = new Map();
    if (roles) {
      roles.forEach(r => roleMap.set(r.user_id, r.role));
    }
    
    // Convert profiles to Users
    const users: User[] = profiles.map(profile => {
      // Use the mapped role or default to 'customer'
      const role = roleMap.has(profile.id) ? roleMap.get(profile.id) : 'customer';
      
      return {
        id: profile.id,
        email: `${profile.id}@example.com`, // Placeholder
        firstName: profile.first_name || '',
        lastName: profile.last_name || '',
        role: role as UserRole,
        addresses: [], // We'd need to fetch these separately if needed
        loyaltyPoints: profile.loyalty_points || 0,
        createdAt: profile.created_at,
        phone: profile.phone || undefined,
        dietaryPreferences: profile.dietary_preferences || []
      };
    });
    
    return users;
  } catch (error) {
    console.error("Error in getAllUsers:", error);
    return [];
  }
};

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
