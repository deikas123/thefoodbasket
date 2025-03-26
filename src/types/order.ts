
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
  total: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  estimatedDelivery: string;
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
  };
}
