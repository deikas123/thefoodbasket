
import { OrderType, OrderItem, OrderStatus } from "@/types/supabase";
import { Order } from "@/types/order";

export const convertToOrder = (orderType: OrderType): Order => {
  return {
    id: orderType.id,
    userId: orderType.user_id,
    items: orderType.items as OrderItem[],
    status: orderType.status as OrderStatus,
    deliveryAddress: orderType.delivery_address as any,
    deliveryMethod: {
      id: (orderType.delivery_method as any).id,
      name: (orderType.delivery_method as any).name,
      price: (orderType.delivery_method as any).price,
      estimatedDelivery: (orderType.delivery_method as any).estimatedDays ? 
        `${(orderType.delivery_method as any).estimatedDays} days` : 
        (orderType.delivery_method as any).estimatedDelivery || "2-3 days"
    },
    paymentMethod: {
      id: (orderType.payment_method as any).id,
      name: (orderType.payment_method as any).name
    },
    subtotal: orderType.subtotal,
    deliveryFee: orderType.delivery_fee,
    discount: orderType.discount,
    loyaltyPointsUsed: orderType.loyalty_points_used,
    loyaltyPointsEarned: orderType.loyalty_points_earned,
    promoCode: orderType.promo_code,
    total: orderType.total,
    notes: orderType.notes,
    createdAt: orderType.created_at,
    updatedAt: orderType.updated_at,
    estimatedDelivery: orderType.estimated_delivery,
    scheduledDelivery: orderType.scheduled_delivery,
    tracking: orderType.tracking as any
  };
};

export const convertToOrders = (orderTypes: OrderType[]): Order[] => {
  return orderTypes.map(convertToOrder);
};
