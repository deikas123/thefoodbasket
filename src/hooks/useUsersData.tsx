
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/types/supabase";
import { User } from "@/types/user";

export const useUsersData = () => {
  return useQuery({
    queryKey: ["admin-all-users"],
    queryFn: async () => {
      console.log("Fetching all users for admin...");
      
      try {
        // Get all profiles
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (profilesError) {
          console.error("Error fetching profiles:", profilesError);
          throw profilesError;
        }
        
        console.log("Profiles found:", profiles);
        
        if (!profiles || profiles.length === 0) {
          console.log("No profiles found");
          return [];
        }
        
        // Get all user roles
        const { data: userRoles, error: rolesError } = await supabase
          .from('user_roles')
          .select('user_id, role');
          
        if (rolesError) {
          console.error("Error fetching user roles:", rolesError);
        }
        
        console.log("User roles found:", userRoles);
        
        // Get actual auth users to get real email addresses
        const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
        
        if (authError) {
          console.error("Error fetching auth users:", authError);
        }
        
        console.log("Auth users found:", authData?.users?.length || 0);
        
        // Create a map of roles by user_id for quick lookup
        const roleMap = new Map();
        if (userRoles) {
          userRoles.forEach(r => roleMap.set(r.user_id, r.role));
        }
        
        // Create a map of emails by user_id
        const emailMap = new Map();
        if (authData?.users) {
          authData.users.forEach((user: any) => emailMap.set(user.id, user.email));
        }
        
        // Combine the data
        const userData: User[] = profiles.map((profile) => {
          const role = roleMap.get(profile.id) || 'customer';
          const email = emailMap.get(profile.id) || `${profile.first_name?.toLowerCase() || 'user'}@foodbasket.com`;
          
          return {
            id: profile.id,
            email: email,
            firstName: profile.first_name || 'Unknown',
            lastName: profile.last_name || 'User',
            role: role as UserRole,
            loyaltyPoints: profile.loyalty_points || 0,
            createdAt: profile.created_at
          };
        });
        
        console.log("Final user data:", userData);
        return userData;
      } catch (error) {
        console.error("Error in users query:", error);
        throw error;
      }
    }
  });
};
