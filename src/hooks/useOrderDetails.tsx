import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { getOrderById, cancelOrder } from "@/services/orderService";
import { Order } from "@/types";
import { toast } from "@/hooks/use-toast";
import { convertToOrder } from "@/utils/typeConverters";
import { supabase } from "@/integrations/supabase/client";

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

export const useOrderDetails = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  console.log("useOrderDetails hook", { orderId, user, isAuthenticated, authLoading });

  const fetchOrderWithRetry = useCallback(async (retryCount = 0): Promise<void> => {
    if (!orderId) {
      console.log("No orderId provided in URL params");
      setError("No order ID provided");
      setIsLoading(false);
      return;
    }

    if (!user || !isAuthenticated) {
      console.log("User not authenticated, waiting...");
      return;
    }
    
    try {
      console.log(`Fetching order with ID: ${orderId} (attempt ${retryCount + 1})`);
      setIsLoading(true);
      setError(null);
      
      const orderData = await getOrderById(orderId);
      console.log("Fetched order data:", orderData);
      
      if (orderData) {
        const convertedOrder = convertToOrder(orderData);
        console.log("Converted order:", convertedOrder);
        setOrder(convertedOrder);
        setIsLoading(false);
      } else {
        if (retryCount < MAX_RETRIES) {
          console.log(`Order not found, retrying in ${RETRY_DELAY}ms...`);
          setTimeout(() => fetchOrderWithRetry(retryCount + 1), RETRY_DELAY);
        } else {
          console.log("No order data found after retries for ID:", orderId);
          setError("Order not found");
          setOrder(null);
          setIsLoading(false);
        }
      }
    } catch (error) {
      console.error("Failed to fetch order:", error);
      
      if (retryCount < MAX_RETRIES) {
        console.log(`Error fetching order, retrying in ${RETRY_DELAY}ms...`);
        setTimeout(() => fetchOrderWithRetry(retryCount + 1), RETRY_DELAY);
      } else {
        setError("Failed to fetch order details");
        setIsLoading(false);
        toast({
          title: "Error fetching order",
          description: "We couldn't load your order details.",
          variant: "destructive",
        });
      }
    }
  }, [orderId, user, isAuthenticated]);

  useEffect(() => {
    if (!authLoading && user && isAuthenticated) {
      fetchOrderWithRetry(0);
    }
  }, [authLoading, user, isAuthenticated, fetchOrderWithRetry]);

  // Real-time subscription for order updates
  useEffect(() => {
    if (!orderId || !user || !isAuthenticated) return;

    console.log("Setting up real-time subscription for order:", orderId);
    
    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`
        },
        async (payload) => {
          console.log("Real-time order update received:", payload);
          
          if (payload.new) {
            const updatedOrder = convertToOrder(payload.new as any);
            setOrder(updatedOrder);
            
            // Show toast notification for status changes
            if (payload.old && (payload.old as any).status !== (payload.new as any).status) {
              const statusMessages: Record<string, string> = {
                'processing': 'Your order is now being processed!',
                'dispatched': 'Your order has been dispatched!',
                'out_for_delivery': 'Your order is out for delivery!',
                'delivered': 'Your order has been delivered!',
                'cancelled': 'Your order has been cancelled.'
              };
              
              const newStatus = (payload.new as any).status;
              toast({
                title: "Order Status Updated",
                description: statusMessages[newStatus] || `Order status changed to: ${newStatus}`,
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      console.log("Cleaning up real-time subscription for order:", orderId);
      supabase.removeChannel(channel);
    };
  }, [orderId, user, isAuthenticated]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      console.log("User not authenticated, redirecting to login");
      navigate("/login", { state: { from: `/orders/${orderId}` } });
    }
  }, [authLoading, isAuthenticated, navigate, orderId]);

  // Handle order cancellation
  const handleCancelOrder = async () => {
    if (!order) return;
    
    setIsCancelling(true);
    try {
      const updatedOrderType = await cancelOrder(order.id);
      if (updatedOrderType) {
        const updatedOrder = convertToOrder(updatedOrderType);
        setOrder(updatedOrder);
        toast({
          title: "Order cancelled",
          description: "Your order has been successfully cancelled.",
        });
      }
    } catch (error) {
      console.error("Failed to cancel order:", error);
      toast({
        title: "Error cancelling order",
        description: "We couldn't cancel your order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCancelling(false);
    }
  };

  return {
    order,
    isLoading: authLoading || isLoading,
    error,
    isCancelling,
    handleCancelOrder
  };
};
