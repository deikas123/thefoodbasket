
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/types/supabase";

export const getUserRole = async (userId: string): Promise<UserRole | null> => {
  console.log("getRoleService - Fetching role for user:", userId);
  
  try {
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
  } catch (error) {
    console.error("getRoleService - Unexpected error:", error);
    // Default to customer role if there's any error
    return 'customer';
  }
};

export const assignUserRole = async (userId: string, role: UserRole): Promise<void> => {
  console.log("assignUserRole - Assigning role:", role, "to user:", userId);
  
  try {
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
      console.log("assignUserRole - Updating existing role");
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
      console.log("assignUserRole - Creating new role");
      const { error } = await supabase
        .from('user_roles')
        .insert([{ user_id: userId, role }]);
        
      if (error) {
        console.error("Error creating user role:", error);
        throw error;
      }
    }
    
    console.log("assignUserRole - Role assigned successfully");
  } catch (error) {
    console.error("assignUserRole - Unexpected error:", error);
    throw error;
  }
};

export const getAllUserRoles = async (): Promise<{userId: string, role: UserRole}[]> => {
  console.log("getAllUserRoles - Fetching all user roles");
  
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('user_id, role');
      
    if (error) {
      console.error("Error fetching all user roles:", error);
      throw error;
    }
    
    const result = data.map(item => ({
      userId: item.user_id,
      role: item.role as UserRole
    }));
    
    console.log("getAllUserRoles - Found roles:", result.length);
    return result;
  } catch (error) {
    console.error("getAllUserRoles - Unexpected error:", error);
    return [];
  }
};
