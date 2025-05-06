
import { User, RegisterFormData, LoginFormData, UserRole } from "@/types";
import { supabase } from "@/integrations/supabase/client";

// Get the current user from Supabase
export const getCurrentUser = async (): Promise<User | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return null;
  
  // Get user profile from Supabase
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();
    
  // Get user role from Supabase
  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', session.user.id)
    .single();
  
  const role = roleData?.role as UserRole || 'customer';
  
  return {
    id: session.user.id,
    email: session.user.email || '',
    firstName: profile?.first_name || '',
    lastName: profile?.last_name || '',
    role: role,
    addresses: [],
    loyaltyPoints: profile?.loyalty_points || 0,
    createdAt: session.user.created_at || new Date().toISOString(),
    phone: profile?.phone || undefined,
    dietaryPreferences: profile?.dietary_preferences || undefined
  };
};

// Login with Supabase
export const login = async (credentials: LoginFormData): Promise<User> => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: credentials.email,
    password: credentials.password
  });
  
  if (error) {
    throw error;
  }
  
  if (!data.user) {
    throw new Error("No user returned after login");
  }
  
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Failed to get user profile");
  }
  
  return user;
};

// Register with Supabase
export const register = async (userData: RegisterFormData): Promise<User> => {
  // Check if passwords match
  if (userData.confirmPassword && userData.password !== userData.confirmPassword) {
    throw new Error("Passwords don't match");
  }
  
  // Register with Supabase
  const { data, error } = await supabase.auth.signUp({
    email: userData.email,
    password: userData.password,
    options: {
      data: {
        first_name: userData.firstName,
        last_name: userData.lastName
      }
    }
  });
  
  if (error) {
    throw error;
  }
  
  if (!data.user) {
    throw new Error("No user returned after registration");
  }
  
  // The profile will be created by the database trigger
  return {
    id: data.user.id,
    email: data.user.email || '',
    firstName: userData.firstName,
    lastName: userData.lastName,
    role: 'customer', // Always set role to customer by default
    addresses: [],
    loyaltyPoints: 0,
    createdAt: data.user.created_at || new Date().toISOString()
  };
};

// Logout with Supabase
export const logout = async (): Promise<void> => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
};

// Update profile using Supabase
export const updateProfile = async (userData: Partial<User>): Promise<User> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) {
    throw new Error("User not authenticated");
  }
  
  const { error } = await supabase
    .from('profiles')
    .update({
      first_name: userData.firstName,
      last_name: userData.lastName,
      phone: userData.phone,
      dietary_preferences: userData.dietaryPreferences
    })
    .eq('id', session.user.id);
    
  if (error) {
    throw error;
  }
  
  // Get the updated user
  const updatedUser = await getCurrentUser();
  if (!updatedUser) {
    throw new Error("Failed to get updated user profile");
  }
  
  return updatedUser;
};
