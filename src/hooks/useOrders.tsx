
import { useAuth } from "@/context/AuthContext";
import { getUserOrders } from "@/services/orderService";
import { Order } from "@/types";
import { convertToOrders } from "@/utils/typeConverters";
import { useQuery } from "@tanstack/react-query";

export const useOrders = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const { data: orders = [], isLoading: queryLoading, error } = useQuery({
    queryKey: ["user-orders", user?.id],
    queryFn: async () => {
      const orderTypes = await getUserOrders(user!.id);
      return orderTypes && orderTypes.length > 0 ? convertToOrders(orderTypes) : [];
    },
    enabled: !!user && isAuthenticated && !authLoading,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 5,
  });

  return {
    orders,
    isLoading: authLoading || queryLoading,
    error: error ? "Failed to load orders. Please try again." : null,
    user,
    isAuthenticated,
    authLoading
  };
};
