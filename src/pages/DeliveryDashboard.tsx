
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getUserOrders, updateOrderStatus } from "@/services/orderService";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { Order, OrderStatus } from "@/types";
import { MapPin, Package, Truck, CheckCircle, Clock, ArrowRight, Clipboard } from "lucide-react";
import OrderTrackingModal from "@/components/delivery/OrderTrackingModal";
import CustomerSignatureModal from "@/components/delivery/CustomerSignatureModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DeliveryDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);

  const { data: deliveryOrders, isLoading } = useQuery({
    queryKey: ['delivery-orders', user?.id],
    queryFn: () => getUserOrders(user?.id || ''),
    enabled: !!user
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
        { signature: signatureData, deliveredAt: new Date().toISOString() }
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
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'dispatched':
        return <Package className="h-4 w-4 mr-1" />;
      case 'out_for_delivery':
        return <Truck className="h-4 w-4 mr-1" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4 mr-1" />;
      default:
        return <Clock className="h-4 w-4 mr-1" />;
    }
  };
  
  const getActionButtonText = (status: OrderStatus): string => {
    switch (status) {
      case 'dispatched':
        return 'Start Delivery';
      case 'out_for_delivery':
        return 'Mark Delivered';
      default:
        return 'Update Status';
    }
  };

  if (!user) return null;

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
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <p>Loading deliveries...</p>
                </div>
              ) : (
                <>
                  {filterDeliveryOrders(deliveryOrders, ['dispatched', 'out_for_delivery']).length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No active deliveries at the moment</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order ID</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Address</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Estimated Delivery</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filterDeliveryOrders(deliveryOrders, ['dispatched', 'out_for_delivery']).map(order => (
                          <TableRow key={order.id}>
                            <TableCell className="font-medium">{order.id}</TableCell>
                            <TableCell>
                              {order.customer?.name || 'Customer'}
                              <div className="text-xs text-muted-foreground">
                                {order.customer?.phone || 'No phone available'}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                                <span>
                                  {order.deliveryAddress.street}, {order.deliveryAddress.city}, {order.deliveryAddress.state}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant="outline" 
                                className="flex items-center w-fit"
                              >
                                {getStatusIcon(order.status)}
                                {order.status.replace('_', ' ')}
                              </Badge>
                            </TableCell>
                            <TableCell>{order.estimatedDelivery}</TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleViewTracking(order)}
                                >
                                  View Details
                                </Button>
                                
                                {order.status === 'out_for_delivery' && (
                                  <Button 
                                    size="sm"
                                    onClick={() => handleRequestSignature(order)}
                                  >
                                    <Clipboard className="h-3.5 w-3.5 mr-1" />
                                    Get Signature
                                  </Button>
                                )}
                                
                                {order.status === 'dispatched' && (
                                  <Button 
                                    size="sm"
                                    onClick={() => handleStatusUpdate(order)}
                                  >
                                    <span className="mr-1">Start Delivery</span>
                                    <ArrowRight className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </>
              )}
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
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <p>Loading deliveries...</p>
                </div>
              ) : (
                <>
                  {filterDeliveryOrders(deliveryOrders, ['delivered']).length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No completed deliveries yet</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order ID</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Address</TableHead>
                          <TableHead>Delivered At</TableHead>
                          <TableHead>Signature</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filterDeliveryOrders(deliveryOrders, ['delivered']).map(order => (
                          <TableRow key={order.id}>
                            <TableCell className="font-medium">{order.id}</TableCell>
                            <TableCell>
                              {order.customer?.name || 'Customer'}
                              <div className="text-xs text-muted-foreground">
                                {order.customer?.phone || 'No phone available'}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                                <span>
                                  {order.deliveryAddress.street}, {order.deliveryAddress.city}, {order.deliveryAddress.state}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {order.tracking?.deliveredAt ? 
                                new Date(order.tracking.deliveredAt).toLocaleString() : 
                                'Not available'
                              }
                            </TableCell>
                            <TableCell>
                              {order.tracking?.signature ? 
                                <span className="text-green-600">Signed</span> : 
                                <span className="text-amber-600">Not signed</span>
                              }
                            </TableCell>
                            <TableCell>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleViewTracking(order)}
                              >
                                View Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </>
              )}
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
