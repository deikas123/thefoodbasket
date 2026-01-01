
import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { getOrderById, cancelOrder } from "@/services/orderService";
import { Order } from "@/types";
import { toast } from "@/hooks/use-toast";
import { convertToOrder } from "@/utils/typeConverters";

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
        // Order not found - retry if we haven't exhausted retries
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
      
      // Retry on error
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
