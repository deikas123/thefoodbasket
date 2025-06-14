
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { getUserOrders } from "@/services/orderService";
import { Order } from "@/types";
import { convertToOrders } from "@/utils/typeConverters";

export const useOrders = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log("useOrders hook", { user, isAuthenticated, authLoading });

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user || !isAuthenticated) {
        console.log("No user or not authenticated, skipping order fetch");
        setIsLoading(false);
        return;
      }

      try {
        console.log("Fetching orders for user:", user.id);
        setIsLoading(true);
        setError(null);
        
        const orderTypes = await getUserOrders(user.id);
        console.log("Fetched order types:", orderTypes);
        
        if (orderTypes && orderTypes.length > 0) {
          const convertedOrders = convertToOrders(orderTypes);
          console.log("Converted orders:", convertedOrders);
          setOrders(convertedOrders);
        } else {
          console.log("No orders found for user");
          setOrders([]);
        }
      } catch (error) {
        console.error("Failed to fetch orders:", error);
        setError("Failed to load orders. Please try again.");
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading) {
      fetchOrders();
    }
  }, [user, isAuthenticated, authLoading]);

  return {
    orders,
    isLoading: authLoading || isLoading,
    error,
    user,
    isAuthenticated,
    authLoading
  };
};
