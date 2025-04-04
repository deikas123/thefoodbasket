
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Order } from "@/types";
import { MapPin, CheckCircle } from "lucide-react";

interface CompletedDeliveryTableProps {
  orders: Order[];
  isLoading: boolean;
  onViewDetails: (order: Order) => void;
}

const CompletedDeliveryTable: React.FC<CompletedDeliveryTableProps> = ({
  orders,
  isLoading,
  onViewDetails
}) => {
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
        <CheckCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p>No completed deliveries yet</p>
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
          <TableHead>Delivered At</TableHead>
          <TableHead>Signature</TableHead>
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
                onClick={() => onViewDetails(order)}
              >
                View Details
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default CompletedDeliveryTable;
