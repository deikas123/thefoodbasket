
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { getOrderById, cancelOrder } from "@/services/orderService";
import { Order } from "@/types";
import { toast } from "@/hooks/use-toast";
import { convertToOrder } from "@/utils/typeConverters";

export const useOrderDetails = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  console.log("useOrderDetails hook", { orderId, user, isAuthenticated, authLoading });

  useEffect(() => {
    const fetchOrder = async () => {
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
        console.log("Fetching order with ID:", orderId);
        setIsLoading(true);
        setError(null);
        
        const orderData = await getOrderById(orderId);
        console.log("Fetched order data:", orderData);
        
        if (orderData) {
          const convertedOrder = convertToOrder(orderData);
          console.log("Converted order:", convertedOrder);
          setOrder(convertedOrder);
        } else {
          console.log("No order data found for ID:", orderId);
          setError("Order not found");
          setOrder(null);
        }
      } catch (error) {
        console.error("Failed to fetch order:", error);
        setError("Failed to fetch order details");
        toast({
          title: "Error fetching order",
          description: "We couldn't load your order details.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading) {
      fetchOrder();
    }
  }, [orderId, user, isAuthenticated, authLoading]);

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
