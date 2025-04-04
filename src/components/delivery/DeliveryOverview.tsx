
import React, { useMemo } from 'react';
import { Order, OrderStatus } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Truck, CheckCircle, Clock } from "lucide-react";

interface DeliveryStat {
  title: string;
  value: number;
  icon: React.ReactNode;
  description: string;
}

interface DeliveryOverviewProps {
  deliveryOrders: Order[] | undefined;
}

const DeliveryOverview: React.FC<DeliveryOverviewProps> = ({ deliveryOrders = [] }) => {
  const stats = useMemo(() => {
    // Count orders by status
    const dispatched = deliveryOrders.filter(order => order.status === 'dispatched').length;
    const outForDelivery = deliveryOrders.filter(order => order.status === 'out_for_delivery').length;
    const delivered = deliveryOrders.filter(order => order.status === 'delivered').length;
    
    // Calculate today's deliveries (using the tracking events)
    const today = new Date().toISOString().split('T')[0];
    const todaysDeliveries = deliveryOrders.filter(order => {
      const deliveredEvent = order.tracking?.events.find(event => 
        event.status === 'delivered' && event.timestamp.startsWith(today)
      );
      return deliveredEvent !== undefined;
    }).length;
    
    return [
      {
        title: 'Dispatched',
        value: dispatched,
        icon: <Package className="h-5 w-5 text-blue-500" />,
        description: 'Orders waiting for pickup'
      },
      {
        title: 'Out for Delivery',
        value: outForDelivery,
        icon: <Truck className="h-5 w-5 text-amber-500" />,
        description: 'Orders currently being delivered'
      },
      {
        title: 'Today\'s Deliveries',
        value: todaysDeliveries,
        icon: <Clock className="h-5 w-5 text-purple-500" />,
        description: 'Orders delivered today'
      },
      {
        title: 'Total Completed',
        value: delivered,
        icon: <CheckCircle className="h-5 w-5 text-green-500" />,
        description: 'All completed deliveries'
      }
    ] as DeliveryStat[];
  }, [deliveryOrders]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
              {stat.icon}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DeliveryOverview;
