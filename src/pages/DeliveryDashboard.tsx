
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { OrderStatus } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OrderTrackingModal from "@/components/delivery/OrderTrackingModal";
import CustomerSignatureModal from "@/components/delivery/CustomerSignatureModal";
import ActiveDeliveryTable from "@/components/delivery/ActiveDeliveryTable";
import CompletedDeliveryTable from "@/components/delivery/CompletedDeliveryTable";
import { useDeliveryOrders } from "@/hooks/useDeliveryOrders";

const DeliveryDashboard: React.FC = () => {
  const { user } = useAuth();
  
  const {
    deliveryOrders,
    isLoading,
    filterDeliveryOrders,
    selectedOrder,
    isTrackingModalOpen,
    isSignatureModalOpen,
    setIsTrackingModalOpen,
    handleStatusUpdate,
    handleViewTracking,
    handleRequestSignature,
    handleDeliveryComplete
  } = useDeliveryOrders(user?.id);

  if (!user) return null;

  const activeStatuses: OrderStatus[] = ['dispatched', 'out_for_delivery'];
  const completedStatuses: OrderStatus[] = ['delivered'];

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Delivery Driver Dashboard</h1>
      
      <Tabs defaultValue="active">
        <TabsList className="mb-4">
          <TabsTrigger value="active">Active Deliveries</TabsTrigger>
          <TabsTrigger value="completed">Completed Deliveries</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>Active Deliveries</CardTitle>
              <CardDescription>Manage your delivery tasks and update order status</CardDescription>
            </CardHeader>
            <CardContent>
              <ActiveDeliveryTable
                orders={filterDeliveryOrders(deliveryOrders, activeStatuses)}
                isLoading={isLoading}
                onViewDetails={handleViewTracking}
                onRequestSignature={handleRequestSignature}
                onStatusUpdate={handleStatusUpdate}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed">
          <Card>
            <CardHeader>
              <CardTitle>Completed Deliveries</CardTitle>
              <CardDescription>View your delivery history</CardDescription>
            </CardHeader>
            <CardContent>
              <CompletedDeliveryTable
                orders={filterDeliveryOrders(deliveryOrders, completedStatuses)}
                isLoading={isLoading}
                onViewDetails={handleViewTracking}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {selectedOrder && (
        <OrderTrackingModal
          isOpen={isTrackingModalOpen}
          onClose={() => setIsTrackingModalOpen(false)}
          order={selectedOrder}
          onStatusUpdate={handleStatusUpdate}
        />
      )}

      {selectedOrder && (
        <CustomerSignatureModal
          isOpen={isSignatureModalOpen}
          onClose={() => setIsSignatureModalOpen(false)}
          order={selectedOrder}
          onComplete={handleDeliveryComplete}
        />
      )}
    </div>
  );
};

export default DeliveryDashboard;
