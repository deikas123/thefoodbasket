
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Order, OrderStatus } from "@/types";
import { Package, Truck, CheckCircle, Clock, MapPin, User, Calendar, Banknote, Phone, Mail } from "lucide-react";
import { formatCurrency } from "@/utils/currencyFormatter";

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  onStatusUpdate: (order: Order) => Promise<void>;
}

const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({ 
  isOpen, 
  onClose, 
  order,
  onStatusUpdate
}) => {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5" />;
      case 'processing':
        return <Package className="h-5 w-5" />;
      case 'dispatched':
        return <Package className="h-5 w-5" />;
      case 'out_for_delivery':
        return <Truck className="h-5 w-5" />;
      case 'delivered':
        return <CheckCircle className="h-5 w-5" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };

  const nextStatus = getNextStatus(order.status as OrderStatus);
  const nextStatusText = nextStatus ? nextStatus.replace('_', ' ') : null;

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Order {order.id}</span>
            <Badge variant="outline" className="ml-2">
              {order.status.replace('_', ' ')}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Order details and tracking information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Customer Information */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium flex items-center">
              <User className="h-4 w-4 mr-2" />
              Customer Information
            </h3>
            <div className="bg-muted p-3 rounded-md text-sm">
              <p className="font-medium">{order.customer?.name || 'Customer'}</p>
              <div className="mt-1 space-y-1 text-muted-foreground">
                <div className="flex items-center">
                  <Phone className="h-3.5 w-3.5 mr-2" />
                  <span>{order.customer?.phone || 'No phone available'}</span>
                </div>
                {order.customer?.email && (
                  <div className="flex items-center">
                    <Mail className="h-3.5 w-3.5 mr-2" />
                    <span>{order.customer.email}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              Delivery Address
            </h3>
            <div className="bg-muted p-3 rounded-md text-sm">
              <p>{order.deliveryAddress.street}</p>
              <p>{order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.zipCode}</p>
              {order.deliveryAddress.notes && (
                <p className="mt-2 text-muted-foreground border-t pt-2 mt-2">
                  <span className="font-medium">Notes: </span>
                  {order.deliveryAddress.notes}
                </p>
              )}
            </div>
          </div>

          {/* Driver Information */}
          {order.tracking?.driver && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium flex items-center">
                <User className="h-4 w-4 mr-2" />
                Delivery Driver
              </h3>
              <div className="bg-muted p-3 rounded-md flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full overflow-hidden">
                  <img 
                    src={order.tracking.driver.photo} 
                    alt={order.tracking.driver.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-medium">{order.tracking.driver.name}</p>
                  <p className="text-sm text-muted-foreground">{order.tracking.driver.phone}</p>
                </div>
              </div>
            </div>
          )}

          {/* Delivery Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground flex items-center">
                <Calendar className="h-3.5 w-3.5 mr-1" />
                Estimated Delivery
              </p>
              <p className="font-medium">{order.estimatedDelivery}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground flex items-center">
                <Banknote className="h-3.5 w-3.5 mr-1" />
                Order Total
              </p>
              <p className="font-medium">{formatCurrency(order.total)}</p>
            </div>
          </div>

          {/* Tracking Timeline */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Tracking Timeline</h3>
            <div className="space-y-4">
              {order.tracking?.events.map((event, index) => (
                <div 
                  key={index} 
                  className={`relative pl-6 pb-4 ${
                    index === order.tracking.events.length - 1 ? '' : 'border-l border-muted-foreground/20'
                  }`}
                >
                  <div className="absolute left-0 top-0 -translate-x-1/2 h-5 w-5 rounded-full bg-background border border-primary flex items-center justify-center">
                    {getStatusIcon(event.status)}
                  </div>
                  <div className="-mt-1">
                    <h4 className="text-sm font-medium">{event.description}</h4>
                    <div className="flex flex-wrap gap-x-2 text-xs text-muted-foreground mt-1">
                      <span>{new Date(event.timestamp).toLocaleString()}</span>
                      {event.location && (
                        <span className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {event.location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Items */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Order Items</h3>
            <div className="space-y-2">
              {order.items.map((item) => (
                <div key={item.productId} className="flex justify-between items-center p-2 bg-muted/50 rounded-md">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded bg-background overflow-hidden">
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

          {/* Customer Signature (if available) */}
          {order.tracking?.signature && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                Customer Signature
              </h3>
              <div className="bg-white border rounded-md p-2">
                <img 
                  src={order.tracking.signature} 
                  alt="Customer signature" 
                  className="max-h-32 mx-auto"
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center mt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {nextStatus && (
            <Button 
              onClick={() => {
                onStatusUpdate(order);
                onClose();
              }}
            >
              {getActionButtonText(order.status as OrderStatus)}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderTrackingModal;
