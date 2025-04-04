
import { ProductType, OrderType } from "@/types/supabase";
import { Product, Order } from "@/types";

/**
 * Converts a ProductType (from supabase) to the Product type used in components
 */
export function convertToProduct(product: ProductType): Product {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    image: product.image,
    category: product.category,
    stock: product.stock,
    featured: product.featured || false,
    rating: product.rating || 0,
    numReviews: product.num_reviews || 0,
    discountPercentage: product.discountPercentage || 0,
  };
}

/**
 * Converts an array of ProductType to Product array
 */
export function convertToProducts(products: ProductType[]): Product[] {
  return products.map(convertToProduct);
}

/**
 * Converts an OrderType (from supabase) to the Order type used in components
 */
export function convertToOrder(order: OrderType): Order {
  return {
    id: order.id,
    userId: order.user_id,
    status: order.status,
    items: order.items,
    subtotal: order.subtotal,
    deliveryFee: order.delivery_fee,
    discount: order.discount || 0,
    total: order.total,
    createdAt: new Date(order.created_at),
    deliveryMethod: {
      id: order.delivery_method.id,
      name: order.delivery_method.name,
      price: order.delivery_method.price,
      estimatedDelivery: `${order.delivery_method.estimatedDays} days`,
    },
    paymentMethod: order.payment_method,
    deliveryAddress: {
      street: order.delivery_address.street,
      city: order.delivery_address.city,
      state: order.delivery_address.state,
      zipCode: order.delivery_address.zipCode,
    },
    estimatedDelivery: order.estimated_delivery,
    scheduledDelivery: order.scheduled_delivery,
    notes: order.notes,
    loyaltyPointsEarned: order.loyalty_points_earned || 0,
    loyaltyPointsUsed: order.loyalty_points_used || 0,
    promoCode: order.promo_code,
    tracking: order.tracking,
  };
}

/**
 * Converts an array of OrderType to Order array
 */
export function convertToOrders(orders: OrderType[]): Order[] {
  return orders.map(convertToOrder);
}
