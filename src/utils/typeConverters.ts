
import { OrderType } from '@/types/supabase';
import { Order } from '@/types/order';

export const convertToOrder = (orderType: OrderType): Order => {
  return {
    id: orderType.id,
    userId: orderType.user_id,
    items: Array.isArray(orderType.items) ? orderType.items as any[] : [],
    status: orderType.status as Order['status'],
    deliveryAddress: orderType.delivery_address as Order['deliveryAddress'],
    customer: {
      name: 'Customer', // Default name
      phone: 'No phone available', // Default phone
      email: undefined
    },
    deliveryMethod: orderType.delivery_method as Order['deliveryMethod'],
    paymentMethod: orderType.payment_method as Order['paymentMethod'],
    subtotal: orderType.subtotal,
    deliveryFee: orderType.delivery_fee,
    discount: orderType.discount || undefined,
    loyaltyPointsUsed: orderType.loyalty_points_used || undefined,
    loyaltyPointsEarned: orderType.loyalty_points_earned || undefined,
    promoCode: orderType.promo_code || undefined,
    total: orderType.total,
    notes: orderType.notes || undefined,
    createdAt: orderType.created_at,
    updatedAt: orderType.updated_at,
    estimatedDelivery: orderType.estimated_delivery,
    scheduledDelivery: orderType.scheduled_delivery as Order['scheduledDelivery'] || undefined,
    tracking: orderType.tracking as Order['tracking'] || undefined
  };
};

export const convertToOrders = (orderTypes: OrderType[]): Order[] => {
  return orderTypes.map(convertToOrder);
};
