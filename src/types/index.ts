import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}

// Add an alias for backward compatibility
export const useMobile = useIsMobile;

// Import the Order type early so it's available for references below
import { Order, OrderItem } from './order';

// Product related types
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
  unit?: string;
  discountPercentage?: number;
}

export interface Category {
  id: string;
  name: string;
  image: string;
  productCount: number;
}

// User related types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  addresses: Address[];
  loyaltyPoints: number;
  createdAt: string;
  phone?: string;
  photoURL?: string;
  dietaryPreferences?: string[];
}

export type UserRole = "admin" | "customer" | "delivery" | "customer_service" | "accountant" | "order_fulfillment";

export interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
}

// Cart related types
export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (product: Product | CartItem, quantity?: number) => void;
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
}

// Wishlist related types
export interface WishlistItem {
  product: Product;
  addedAt: string;
}

export interface WishlistContextType {
  items: WishlistItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  itemCount: number;
}

// Auth related types
export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (userData: RegisterFormData) => Promise<User>;
  logout: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<User>;
}

// Delivery related types
export interface DeliveryOption {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDelivery: string;
  speed: "standard" | "express";
}

// Payment related types
export interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  description?: string;
}

// Re-export all types from separate files
export * from './order';
export * from './wallet';
export * from './foodBasket';
export * from './payLater';
export * from './kyc';
export * from './autoReplenish';
