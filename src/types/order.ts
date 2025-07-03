
export type OrderStatus = 
  | "pending" 
  | "processing" 
  | "dispatched" 
  | "out_for_delivery" 
  | "delivered" 
  | "cancelled";

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  status: OrderStatus;
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    notes?: string;
  };
  customer: {
    name: string;
    phone: string;
    email?: string;
  };
  deliveryMethod: {
    id: string;
    name: string;
    price: number;
    estimatedDelivery: string;
  };
  paymentMethod: {
    id: string;
    name: string;
  };
  subtotal: number;
  deliveryFee: number;
  discount?: number;
  loyaltyPointsUsed?: number;
  loyaltyPointsEarned?: number;
  promoCode?: string;
  total: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  estimatedDelivery: string;
  scheduledDelivery?: {
    date: string;
    timeSlot: string;
  };
  tracking?: {
    events: {
      status: OrderStatus;
      timestamp: string;
      description: string;
      location?: string;
    }[];
    driver?: {
      id: string;
      name: string;
      phone: string;
      photo: string;
    };
    signature?: string;
    deliveredAt?: string;
  };
}

export interface OrderSummary {
  id: string;
  status: OrderStatus;
  total: number;
  itemCount: number;
  createdAt: string;
  estimatedDelivery: string;
}
