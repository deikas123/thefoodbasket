

import { OrderType, ProductType } from '@/types/supabase';
import { Order } from '@/types/order';
import { Product } from '@/types';

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
    deliveryMethod: {
      id: (orderType.delivery_method as any)?.id || '',
      name: (orderType.delivery_method as any)?.name || '',
      price: (orderType.delivery_method as any)?.price || 0,
      estimatedDelivery: (orderType.delivery_method as any)?.estimatedDelivery || 
                        `${(orderType.delivery_method as any)?.estimated_delivery_days || 1} days`
    },
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

export const convertToProduct = (productType: ProductType): Product => {
  return {
    id: productType.id,
    name: productType.name,
    price: productType.price,
    image: productType.image,
    description: productType.description,
    category: productType.category_id,
    stock: productType.stock,
    rating: productType.rating,
    numReviews: productType.num_reviews,
    featured: productType.featured,
    discountPercentage: productType.discount_percentage || undefined
  };
};

export const convertToProducts = (productTypes: ProductType[]): Product[] => {
  return productTypes.map(convertToProduct);
};
