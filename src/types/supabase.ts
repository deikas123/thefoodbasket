
import { Database } from '@/integrations/supabase/types';

// Extending types from the auto-generated Supabase types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];

// Define order statuses
export type OrderStatus = 'pending' | 'processing' | 'dispatched' | 'out_for_delivery' | 'delivered' | 'cancelled';

// Define user roles
export type UserRole = 'customer' | 'admin' | 'delivery';

export interface ProfileType extends Tables<'profiles'> {
  role?: UserRole;
}

export interface AddressType extends Tables<'addresses'> {}

export interface ProductType extends Tables<'products'> {}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface OrderType extends Tables<'orders'> {
  items: OrderItem[];
  tracking?: {
    events: {
      status: string;
      timestamp: string;
      location?: string;
      note?: string;
    }[];
  };
  delivery_method: {
    id: string;
    name: string;
    price: number;
    estimatedDays: number;
  };
  payment_method: {
    id: string;
    name: string;
    last4?: string;
  };
  delivery_address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
}
