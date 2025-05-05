
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";
import { UserRole } from "@/types/supabase";
import { getUserRole } from "./roleService";
import { getUserProfile } from "./profileService";
import { getUserAddresses, formatAddressFromDb } from "./addressService";

export const getUserById = async (userId: string): Promise<User | null> => {
  try {
    // Get the user profile
    const profile = await getUserProfile(userId);
    if (!profile) {
      console.error("Profile not found for user:", userId);
      return null;
    }
    
    // Get the user role
    const role = await getUserRole(userId);
    
    // Get user's addresses
    const addressesData = await getUserAddresses(userId);
    const addresses = addressesData.map(formatAddressFromDb);
    
    // Convert profile to User type
    const user: User = {
      id: profile.id,
      email: `${profile.id}@example.com`, // Placeholder since we don't have this in profiles
      firstName: profile.first_name || '',
      lastName: profile.last_name || '',
      role: role as UserRole,
      addresses,
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

// Re-export functions from the other service files
export { getUserProfile, updateUserProfile, getUserDietaryPreferences, updateUserDietaryPreferences } from './profileService';
export { getUserAddresses, addUserAddress, updateUserAddress, deleteUserAddress } from './addressService';
export { getUserRole, assignUserRole } from './roleService';
