export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  featured: boolean;
  rating: number;
  numReviews: number;
}

export interface Category {
  id: string;
  name: string;
  image: string;
  productCount: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface WishlistItem {
  product: Product;
}

export interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
}

export interface DeliveryOption {
  id: string;
  name: string;
  price: number;
  estimatedDelivery: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  icon?: string;
  description?: string;
}

export type CartContextType = {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  checkout: (
    userId: string,
    deliveryAddress: Order["deliveryAddress"],
    deliveryMethod: Order["deliveryMethod"],
    paymentMethod: Order["paymentMethod"],
    notes?: string
  ) => Promise<Order>;
  itemCount: number;
  total: number;
};

// Order related types
export * from './order';
