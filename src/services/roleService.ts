import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/types/supabase";

export interface RoleDefinition {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  permissions: string[];
  is_system_role: boolean;
  color: string;
  icon: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export const getUserRole = async (userId: string): Promise<UserRole | null> => {
  console.log("getRoleService - Fetching role for user:", userId);
  
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (error) {
      console.error("getRoleService - Error fetching user role:", error);
      throw error;
    }
    
    if (!data) {
      console.log("getRoleService - No specific role found for user, defaulting to customer");
      return 'customer';
    }
    
    console.log("getRoleService - Role found in database:", data.role);
    return data.role as UserRole;
  } catch (error) {
    console.error("getRoleService - Unexpected error:", error);
    return 'customer';
  }
};

export const assignUserRole = async (userId: string, role: UserRole): Promise<void> => {
  console.log("assignUserRole - Assigning role:", role, "to user:", userId);
  
  if (!userId || !role) {
    throw new Error("User ID and role are required");
  }
  
  try {
    const { data: existingRole, error: fetchError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error("Error checking existing role:", fetchError);
      throw fetchError;
    }
    
    if (existingRole) {
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

// Role Definitions Management
export const getAllRoles = async (): Promise<RoleDefinition[]> => {
  const { data, error } = await supabase
    .from('role_definitions')
    .select('*')
    .order('is_system_role', { ascending: false })
    .order('display_name');
    
  if (error) {
    console.error('Error fetching roles:', error);
    return [];
  }
  
  return (data || []) as RoleDefinition[];
};

export const getActiveRoles = async (): Promise<RoleDefinition[]> => {
  const { data, error } = await supabase
    .from('role_definitions')
    .select('*')
    .eq('active', true)
    .order('display_name');
    
  if (error) {
    console.error('Error fetching active roles:', error);
    return [];
  }
  
  return (data || []) as RoleDefinition[];
};

export const createRole = async (role: Partial<RoleDefinition>): Promise<RoleDefinition | null> => {
  const { data, error } = await supabase
    .from('role_definitions')
    .insert({
      name: role.name,
      display_name: role.display_name,
      description: role.description,
      permissions: role.permissions || [],
      color: role.color || '#6B7280',
      icon: role.icon || 'user',
      is_system_role: false,
      active: true
    })
    .select()
    .single();
    
  if (error) {
    console.error('Error creating role:', error);
    return null;
  }
  
  return data as RoleDefinition;
};

export const updateRole = async (id: string, updates: Partial<RoleDefinition>): Promise<boolean> => {
  const { error } = await supabase
    .from('role_definitions')
    .update(updates)
    .eq('id', id);
    
  if (error) {
    console.error('Error updating role:', error);
    return false;
  }
  
  return true;
};

export const deleteRole = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('role_definitions')
    .update({ active: false })
    .eq('id', id)
    .eq('is_system_role', false);
    
  if (error) {
    console.error('Error deleting role:', error);
    return false;
  }
  
  return true;
};

export const assignRoleToUser = async (userId: string, roleName: string): Promise<boolean> => {
  const { error } = await supabase
    .from('user_roles')
    .upsert({
      user_id: userId,
      role: roleName
    }, {
      onConflict: 'user_id,role'
    });
    
  if (error) {
    console.error('Error assigning role:', error);
    return false;
  }
  
  return true;
};

export const removeRoleFromUser = async (userId: string, roleName: string): Promise<boolean> => {
  const { error } = await supabase
    .from('user_roles')
    .delete()
    .eq('user_id', userId)
    .eq('role', roleName);
    
  if (error) {
    console.error('Error removing role:', error);
    return false;
  }
  
  return true;
};

export const getUserRoles = async (userId: string): Promise<string[]> => {
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId);
    
  if (error) {
    console.error('Error fetching user roles:', error);
    return [];
  }
  
  return data?.map(r => r.role) || [];
};
