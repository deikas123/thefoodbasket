
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
        // Get all profiles (admin RLS policy allows viewing all)
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (profilesError) {
          console.error("Error fetching profiles:", profilesError);
          throw profilesError;
        }
        
        console.log("Profiles found:", profiles?.length || 0);
        
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
        
        // Create a map of roles by user_id for quick lookup
        const roleMap = new Map();
        if (userRoles) {
          userRoles.forEach(r => roleMap.set(r.user_id, r.role));
        }
        
        // Combine the data - email now comes from profiles table
        const userData: User[] = profiles.map((profile: any) => {
          const role = roleMap.get(profile.id) || 'customer';
          // Use email from profiles, fallback to generated email for legacy users
          const email = profile.email || `${profile.first_name?.toLowerCase() || 'user'}.${profile.id.slice(0, 8)}@example.com`;
          
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
        
        console.log("Final user data:", userData.length);
        return userData;
      } catch (error) {
        console.error("Error in users query:", error);
        throw error;
      }
    }
  });
};
