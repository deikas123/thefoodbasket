
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getUserOrders } from "@/services/orderService";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { Order } from "@/types";

const DeliveryDashboard: React.FC = () => {
  const { user } = useAuth();

  const { data: deliveryOrders, isLoading } = useQuery({
    queryKey: ['delivery-orders', user?.id],
    queryFn: () => getUserOrders(user?.id || ''),
    enabled: !!user
  });

  const filterDeliveryOrders = (orders: Order[]) => 
    orders.filter(order => 
      ['dispatched', 'out_for_delivery'].includes(order.status)
    );

  if (!user) return null;

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Delivery Dashboard</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Active Deliveries</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading deliveries...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer Address</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filterDeliveryOrders(deliveryOrders || []).map(order => (
                  <TableRow key={order.id}>
                    <TableCell>{order.id}</TableCell>
                    <TableCell>
                      {order.deliveryAddress.street}, 
                      {order.deliveryAddress.city}, 
                      {order.deliveryAddress.state}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {order.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>{order.total}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DeliveryDashboard;
