import { OrderType, OrderItem, OrderStatus, ProductType } from "@/types/supabase";
import { Order } from "@/types/order";
import { Product } from "@/types";

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
    assignedTo: (orderType as any).assigned_to,
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

export const convertToProduct = (productType: ProductType): Product => {
  return {
    id: productType.id,
    name: productType.name,
    description: productType.description,
    price: Number(productType.price),
    image: productType.image,
    category: productType.category,
    stock: productType.stock,
    featured: productType.featured,
    rating: Number(productType.rating),
    numReviews: productType.numReviews,
    discountPercentage: productType.discountPercentage ? Number(productType.discountPercentage) : undefined
  };
};

export const convertToProducts = (productTypes: ProductType[]): Product[] => {
  return productTypes.map(convertToProduct);
};
