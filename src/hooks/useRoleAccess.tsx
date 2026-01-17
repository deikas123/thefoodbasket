
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface UseRoleAccessOptions {
  allowedRoles: string[];
}

export const useRoleAccess = ({ allowedRoles }: UseRoleAccessOptions) => {
  const { user, loading: authLoading } = useAuth();

  const { data: hasAccess, isLoading: roleLoading } = useQuery({
    queryKey: ["user-role-access", user?.id, allowedRoles],
    queryFn: async () => {
      if (!user) return false;

      const { data: userRole } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .in("role", allowedRoles)
        .maybeSingle();

      return !!userRole;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes - roles don't change often
    gcTime: 10 * 60 * 1000,   // 10 minutes cache
  });

  return {
    user,
    hasAccess: hasAccess ?? false,
    isLoading: authLoading || roleLoading,
  };
};

export const useStoreAccess = () => {
  const { user, loading: authLoading } = useAuth();

  const { data, isLoading: accessLoading } = useQuery({
    queryKey: ["store-access", user?.id],
    queryFn: async () => {
      if (!user) return { hasAccess: false, storeId: null };

      // Check if user is a store admin
      const { data: storeAdmin } = await supabase
        .from("store_admins")
        .select("store_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (storeAdmin) {
        return { hasAccess: true, storeId: storeAdmin.store_id };
      }

      // Also check if user has store_admin role
      const { data: userRole } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .in("role", ["admin", "store_admin"])
        .maybeSingle();

      return { hasAccess: !!userRole, storeId: null };
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  return {
    user,
    hasAccess: data?.hasAccess ?? false,
    storeId: data?.storeId ?? null,
    isLoading: authLoading || accessLoading,
  };
};
