
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
  stock: number;
  discountPercentage?: number;
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
  addedAt?: string;
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
  description?: string;
  speed?: string;
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

export type WishlistContextType = {
  items: WishlistItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  itemCount: number;
};

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  addresses: Address[];
  phone?: string;
  dietaryPreferences?: string[];
  loyaltyPoints: number;
  createdAt: string;
}

export type UserRole = "admin" | "customer" | "delivery";

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
}

export type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterFormData) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<User>;
};

// Order related types
export * from './order';
