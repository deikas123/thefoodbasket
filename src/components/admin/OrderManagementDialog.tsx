
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
import { MapPin, Package, User, Calendar, Clock, Phone, Mail } from "lucide-react";

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
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium flex items-center mb-2">
                <User className="h-4 w-4 mr-2" />
                Customer Details
              </h3>
              <div className="bg-muted p-4 rounded-md text-sm space-y-2">
                <div>
                  <span className="font-medium">Name:</span>
                  <p className="text-foreground">{order.customer?.name || 'Not provided'}</p>
                </div>
                <div className="flex items-center">
                  <Phone className="h-3 w-3 mr-2" />
                  <span className="font-medium mr-2">Phone:</span>
                  <p className="text-foreground">{order.customer?.phone || 'Not provided'}</p>
                </div>
                {order.customer?.email && (
                  <div className="flex items-center">
                    <Mail className="h-3 w-3 mr-2" />
                    <span className="font-medium mr-2">Email:</span>
                    <p className="text-foreground">{order.customer.email}</p>
                  </div>
                )}
                <div>
                  <span className="font-medium">User ID:</span>
                  <p className="text-xs text-muted-foreground font-mono">{order.userId}</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium flex items-center mb-2">
                <Calendar className="h-4 w-4 mr-2" />
                Order Summary
              </h3>
              <div className="bg-muted p-4 rounded-md text-sm space-y-2">
                <div>
                  <span className="font-medium">Total:</span>
                  <span className="ml-2 text-lg font-bold">{formatCurrency(order.total)}</span>
                </div>
                <div>
                  <span className="font-medium">Items:</span>
                  <span className="ml-2">{order.items.length}</span>
                </div>
                <div>
                  <span className="font-medium">Subtotal:</span>
                  <span className="ml-2">{formatCurrency(order.subtotal)}</span>
                </div>
                <div>
                  <span className="font-medium">Delivery Fee:</span>
                  <span className="ml-2">{formatCurrency(order.deliveryFee)}</span>
                </div>
                <div className="flex items-center pt-2 border-t">
                  <Clock className="h-3 w-3 mr-1" />
                  <span className="text-xs">Est. Delivery: {order.estimatedDelivery}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Delivery Address with Location Details */}
          <div>
            <h3 className="text-sm font-medium flex items-center mb-2">
              <MapPin className="h-4 w-4 mr-2" />
              Complete Delivery Location
            </h3>
            <div className="bg-muted p-4 rounded-md text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Street Address</h4>
                  <p className="text-foreground">{order.deliveryAddress.street}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">City & Region</h4>
                  <p className="text-foreground">{order.deliveryAddress.city}, {order.deliveryAddress.state}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Postal Code</h4>
                  <p className="text-foreground">{order.deliveryAddress.zipCode}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Delivery Method</h4>
                  <p className="text-foreground">{order.deliveryMethod.name}</p>
                  <p className="text-xs text-muted-foreground">Fee: {formatCurrency(order.deliveryMethod.price)}</p>
                </div>
              </div>
              {order.deliveryAddress.notes && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="font-medium mb-2">Special Instructions</h4>
                  <p className="text-foreground bg-background p-2 rounded border">
                    {order.deliveryAddress.notes}
                  </p>
                </div>
              )}
              {order.notes && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="font-medium mb-2">Order Notes</h4>
                  <p className="text-foreground bg-background p-2 rounded border">
                    {order.notes}
                  </p>
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
              {order.items.map((item, index) => (
                <div key={`${item.productId}-${index}`} className="flex justify-between items-center p-3 bg-muted/50 rounded-md">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded bg-background overflow-hidden border">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <span className="text-sm font-medium">{item.name}</span>
                      <p className="text-xs text-muted-foreground">ID: {item.productId}</p>
                    </div>
                  </div>
                  <div className="text-sm text-right">
                    <div className="font-medium">{formatCurrency(item.price * item.quantity)}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatCurrency(item.price)} × {item.quantity}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Information */}
          <div>
            <h3 className="text-sm font-medium mb-2">Payment Information</h3>
            <div className="bg-muted p-3 rounded-md text-sm">
              <p><span className="font-medium">Method:</span> {order.paymentMethod.name}</p>
              {order.loyaltyPointsUsed && (
                <p><span className="font-medium">Loyalty Points Used:</span> {order.loyaltyPointsUsed}</p>
              )}
              {order.promoCode && (
                <p><span className="font-medium">Promo Code:</span> {order.promoCode}</p>
              )}
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
