
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/types/supabase";

export const getUserRole = async (userId: string): Promise<UserRole | null> => {
  console.log("getRoleService - Fetching role for user:", userId);
  
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .single();
    
  if (error) {
    if (error.code === 'PGRST116') {
      // Role not found, user is a regular customer
      console.log("getRoleService - No specific role found for user, defaulting to customer");
      return 'customer';
    }
    console.error("getRoleService - Error fetching user role:", error);
    throw error;
  }
  
  console.log("getRoleService - Role found in database:", data.role);
  return data.role as UserRole;
};

export const assignUserRole = async (userId: string, role: UserRole): Promise<void> => {
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

export const getAllUserRoles = async (): Promise<{userId: string, role: UserRole}[]> => {
  const { data, error } = await supabase
    .from('user_roles')
    .select('user_id, role');
    
  if (error) {
    console.error("Error fetching all user roles:", error);
    throw error;
  }
  
  return data.map(item => ({
    userId: item.user_id,
    role: item.role as UserRole
  }));
};
