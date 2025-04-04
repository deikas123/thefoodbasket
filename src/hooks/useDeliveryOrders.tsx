
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getUserOrders, updateOrderStatus } from '@/services/orderService';
import { Order, OrderStatus } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { convertToOrders } from '@/utils/typeConverters';

export const useDeliveryOrders = (userId: string | undefined) => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: orderTypes, isLoading } = useQuery({
    queryKey: ['delivery-orders', userId],
    queryFn: async () => {
      const orders = await getUserOrders(userId || '');
      return convertToOrders(orders); // Convert OrderType[] to Order[]
    },
    enabled: !!userId
  });

  const filterDeliveryOrders = (orders: Order[] = [], statuses: OrderStatus[]) => 
    orders.filter(order => 
      statuses.includes(order.status as OrderStatus)
    );
    
  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    switch (currentStatus) {
      case 'dispatched':
        return 'out_for_delivery';
      case 'out_for_delivery':
        return 'delivered';
      default:
        return null;
    }
  };
  
  const handleStatusUpdate = async (order: Order) => {
    const nextStatus = getNextStatus(order.status as OrderStatus);
    
    if (!nextStatus) {
      toast({
        title: "Status Update Error",
        description: "No valid next status available",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const updatedOrder = await updateOrderStatus(order.id, nextStatus);
      
      if (updatedOrder) {
        toast({
          title: "Status Updated",
          description: `Order ${order.id} updated to ${nextStatus.replace('_', ' ')}`,
        });
        queryClient.invalidateQueries({ queryKey: ['delivery-orders'] });
      }
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Could not update the order status",
        variant: "destructive"
      });
    }
  };
  
  const handleViewTracking = (order: Order) => {
    setSelectedOrder(order);
    setIsTrackingModalOpen(true);
  };

  const handleRequestSignature = (order: Order) => {
    setSelectedOrder(order);
    setIsSignatureModalOpen(true);
  };

  const handleDeliveryComplete = async (order: Order, signatureData: string) => {
    try {
      // Update the order with signature data and mark as delivered
      const updatedOrder = await updateOrderStatus(
        order.id, 
        'delivered', 
        { 
          status: 'delivered',
          timestamp: new Date().toISOString(),
          deliveredAt: new Date().toISOString(),
          signature: signatureData
        }
      );
      
      if (updatedOrder) {
        toast({
          title: "Delivery Completed",
          description: "Order has been successfully delivered and signed for",
        });
        queryClient.invalidateQueries({ queryKey: ['delivery-orders'] });
        setIsSignatureModalOpen(false);
      }
    } catch (error) {
      toast({
        title: "Completion Failed",
        description: "Could not complete the delivery process",
        variant: "destructive"
      });
    }
  };

  return {
    deliveryOrders: orderTypes || [],
    isLoading,
    filterDeliveryOrders,
    selectedOrder,
    isTrackingModalOpen,
    isSignatureModalOpen,
    setIsTrackingModalOpen,
    setIsSignatureModalOpen,
    handleStatusUpdate,
    handleViewTracking,
    handleRequestSignature,
    handleDeliveryComplete
  };
};
