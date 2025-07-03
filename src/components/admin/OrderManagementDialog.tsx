
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Order, OrderStatus } from "@/types/order";
import { updateOrderStatus } from "@/services/orderService";
import { addTrackingEvent } from "@/services/orderTrackingService";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/utils/currencyFormatter";
import { MapPin, Package, User, Calendar, Clock } from "lucide-react";

interface OrderManagementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  onOrderUpdate: (updatedOrder: Order) => void;
}

const OrderManagementDialog: React.FC<OrderManagementDialogProps> = ({
  isOpen,
  onClose,
  order,
  onOrderUpdate
}) => {
  const [newStatus, setNewStatus] = useState<OrderStatus>(order.status as OrderStatus);
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const statusOptions: { value: OrderStatus; label: string }[] = [
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'dispatched', label: 'Dispatched' },
    { value: 'out_for_delivery', label: 'Out for Delivery' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "processing": return "bg-blue-100 text-blue-800";
      case "dispatched": return "bg-purple-100 text-purple-800";
      case "out_for_delivery": return "bg-indigo-100 text-indigo-800";
      case "delivered": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleStatusUpdate = async () => {
    if (newStatus === order.status) {
      toast({
        title: "No Changes",
        description: "Status is already set to this value",
        variant: "destructive"
      });
      return;
    }

    setIsUpdating(true);
    try {
      // Update order status
      const updatedOrderType = await updateOrderStatus(order.id, newStatus);
      
      // Add custom tracking event if description or location provided
      if (description || location) {
        await addTrackingEvent(
          order.id, 
          newStatus, 
          description || `Order status updated to ${newStatus.replace('_', ' ')}`,
          location
        );
      }

      toast({
        title: "Order Updated",
        description: `Order status updated to ${newStatus.replace('_', ' ')}`,
      });

      // Convert and update the order
      const convertedOrder = {
        ...order,
        status: newStatus,
        updatedAt: new Date().toISOString()
      };
      
      onOrderUpdate(convertedOrder);
      onClose();
    } catch (error) {
      console.error("Error updating order:", error);
      toast({
        title: "Update Failed",
        description: "Could not update the order status",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Manage Order {order.id}</span>
            <Badge className={getStatusColor(order.status as OrderStatus)}>
              {order.status.replace('_', ' ')}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Update order status and add tracking information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Enhanced Customer Information */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <h3 className="text-sm font-medium flex items-center mb-2">
                <User className="h-4 w-4 mr-2" />
                Customer Information
              </h3>
              <div className="bg-muted p-4 rounded-md space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Name:</span>
                  <span className="text-sm font-medium">{order.customer?.name || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Phone:</span>
                  <span className="text-sm font-medium">{order.customer?.phone || 'No phone available'}</span>
                </div>
                {order.customer?.email && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Email:</span>
                    <span className="text-sm font-medium">{order.customer.email}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">User ID:</span>
                  <span className="text-sm font-mono text-xs">{order.userId}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium flex items-center mb-2">
                <Calendar className="h-4 w-4 mr-2" />
                Order Details
              </h3>
              <div className="bg-muted p-3 rounded-md text-sm">
                <p>Total: <span className="font-medium">{formatCurrency(order.total)}</span></p>
                <p>Items: <span className="font-medium">{order.items.length}</span></p>
                <p className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  Estimated: {new Date(order.estimatedDelivery).toLocaleDateString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Created: {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Enhanced Delivery Address */}
          <div>
            <h3 className="text-sm font-medium flex items-center mb-2">
              <MapPin className="h-4 w-4 mr-2" />
              Delivery Address
            </h3>
            <div className="bg-muted p-4 rounded-md space-y-1">
              <p className="font-medium">{order.deliveryAddress.street}</p>
              <p>{order.deliveryAddress.city}, {order.deliveryAddress.state}</p>
              <p className="text-muted-foreground">{order.deliveryAddress.zipCode}</p>
              {order.deliveryAddress.notes && (
                <div className="mt-3 pt-2 border-t">
                  <p className="text-xs text-muted-foreground">Delivery Notes:</p>
                  <p className="text-sm">{order.deliveryAddress.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h3 className="text-sm font-medium flex items-center mb-2">
              <Package className="h-4 w-4 mr-2" />
              Order Items ({order.items.length})
            </h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {order.items.map((item) => (
                <div key={item.productId} className="flex justify-between items-center p-2 bg-muted/50 rounded-md">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded bg-background overflow-hidden">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <span className="text-sm">{item.name}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground mr-2">x{item.quantity}</span>
                    <span>{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status Update Form */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-medium mb-4">Update Order Status</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="status">New Status</Label>
                <Select value={newStatus} onValueChange={(value) => setNewStatus(value as OrderStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="location">Location (Optional)</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Warehouse, Distribution Center, Customer Location"
                />
              </div>

              <div>
                <Label htmlFor="description">Custom Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add a custom tracking message..."
                  rows={2}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleStatusUpdate} 
            disabled={isUpdating || newStatus === order.status}
          >
            {isUpdating ? "Updating..." : "Update Order"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderManagementDialog;
