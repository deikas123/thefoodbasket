
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Order } from "@/types";
import { MapPin, Package, Truck, ArrowRight, Clipboard } from "lucide-react";

interface ActiveDeliveryTableProps {
  orders: Order[];
  isLoading: boolean;
  onViewDetails: (order: Order) => void;
  onRequestSignature: (order: Order) => void;
  onStatusUpdate: (order: Order) => void;
}

const ActiveDeliveryTable: React.FC<ActiveDeliveryTableProps> = ({
  orders,
  isLoading,
  onViewDetails,
  onRequestSignature,
  onStatusUpdate
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'dispatched':
        return <Package className="h-4 w-4 mr-1" />;
      case 'out_for_delivery':
        return <Truck className="h-4 w-4 mr-1" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <p>Loading deliveries...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p>No active deliveries at the moment</p>
      </div>
    );
  }

  return (
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
        {orders.map(order => (
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
                  onClick={() => onViewDetails(order)}
                >
                  View Details
                </Button>
                
                {order.status === 'out_for_delivery' && (
                  <Button 
                    size="sm"
                    onClick={() => onRequestSignature(order)}
                  >
                    <Clipboard className="h-3.5 w-3.5 mr-1" />
                    Get Signature
                  </Button>
                )}
                
                {order.status === 'dispatched' && (
                  <Button 
                    size="sm"
                    onClick={() => onStatusUpdate(order)}
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
  );
};

export default ActiveDeliveryTable;
