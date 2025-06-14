
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from "@/integrations/supabase/client";
import { getUserRole } from "@/services/roleService";
import { User } from "@/types/auth";

export const fetchUserProfile = async (authUser: SupabaseUser): Promise<User> => {
  // Get user profile
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authUser.id)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
  }

  // Get user role
  const userRole = await getUserRole(authUser.id);
  console.log("User role from database:", userRole);

  const userData: User = {
    id: authUser.id,
    email: authUser.email || '',
    first_name: profile?.first_name || '',
    last_name: profile?.last_name || '',
    role: userRole || 'customer',
    // Add compatibility fields
    firstName: profile?.first_name || '',
    lastName: profile?.last_name || '',
    photoURL: profile?.avatar_url || '',
    phone: profile?.phone || '',
    dietaryPreferences: profile?.dietary_preferences || [],
    addresses: profile?.addresses || [],
  };

  console.log("Setting user with role:", userData.role);
  return userData;
};

export const signInUser = async (email: string, password: string) => {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  
  // Get the user after successful login
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const signOutUser = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

// Updated function signature to accept either SupabaseUser or string ID
export const updateUserProfile = async (userOrId: SupabaseUser | string, userData?: Partial<User>) => {
  if (typeof userOrId === 'string') {
    // This is a user ID string, update profile with userData
    const userId = userOrId;
    if (!userData) {
      throw new Error('userData is required when userId is provided as string');
    }
    
    const { error } = await supabase
      .from('profiles')
      .update({
        first_name: userData.firstName || userData.first_name,
        last_name: userData.lastName || userData.last_name,
        phone: userData.phone,
        dietary_preferences: userData.dietaryPreferences
      })
      .eq('id', userId);
      
    if (error) {
      throw error;
    }
  } else {
    // This is a SupabaseUser object, fetch profile
    const authUser = userOrId;
    const userData = await fetchUserProfile(authUser);
    return { userData, shouldRedirect: false };
  }
};

export const registerUser = async (userData: any) => {
  const { email, password, firstName, lastName } = userData;
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName
      }
    }
  });
  
  if (error) throw error;
  
  return data.user;
};
