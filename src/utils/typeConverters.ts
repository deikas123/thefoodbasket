
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
    numReviews: product.num_reviews || product.numReviews || 0,
    discountPercentage: product.discountPercentage || 0,
  };
}

/**
 * Converts a Product to ProductType (for sending to supabase)
 */
export function convertFromProduct(product: Product): ProductType {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    image: product.image,
    category: product.category,
    stock: product.stock,
    featured: product.featured,
    rating: product.rating,
    numReviews: product.numReviews,
    num_reviews: product.numReviews,
    discountPercentage: product.discountPercentage,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
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
    createdAt: order.created_at,
    updatedAt: order.updated_at,
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
    tracking: order.tracking ? {
      events: order.tracking.events.map(event => ({
        status: event.status,
        timestamp: event.timestamp,
        description: event.description || event.note || "",
        location: event.location
      })),
      driver: order.tracking.driver,
      signature: order.tracking.signature,
      deliveredAt: order.tracking.deliveredAt,
    } : undefined,
  };
}

/**
 * Converts an Order to OrderType (for sending to supabase)
 */
export function convertFromOrder(order: Order): OrderType {
  return {
    id: order.id,
    user_id: order.userId,
    status: order.status,
    items: order.items,
    subtotal: order.subtotal,
    delivery_fee: order.deliveryFee,
    discount: order.discount,
    total: order.total,
    created_at: order.createdAt,
    updated_at: order.updatedAt,
    delivery_method: {
      id: order.deliveryMethod.id,
      name: order.deliveryMethod.name,
      price: order.deliveryMethod.price,
      estimatedDays: parseInt(order.deliveryMethod.estimatedDelivery) || 3,
    },
    payment_method: order.paymentMethod,
    delivery_address: {
      street: order.deliveryAddress.street,
      city: order.deliveryAddress.city,
      state: order.deliveryAddress.state,
      zipCode: order.deliveryAddress.zipCode
    },
    estimated_delivery: order.estimatedDelivery,
    scheduled_delivery: order.scheduledDelivery,
    notes: order.notes,
    loyalty_points_earned: order.loyaltyPointsEarned,
    loyalty_points_used: order.loyaltyPointsUsed,
    promo_code: order.promoCode,
    tracking: order.tracking ? {
      events: order.tracking.events.map(event => ({
        status: event.status,
        timestamp: event.timestamp,
        note: event.description,
        location: event.location
      })),
      driver: order.tracking.driver,
      signature: order.tracking.signature,
      deliveredAt: order.tracking.deliveredAt,
    } : undefined
  };
}

/**
 * Converts an array of OrderType to Order array
 */
export function convertToOrders(orders: OrderType[]): Order[] {
  return orders.map(convertToOrder);
}
