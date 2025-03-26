
import React, { createContext, useContext, useState } from "react";
import { CartContextType, Product, CartItem, Order, OrderItem } from "../types";
import { toast } from "@/components/ui/use-toast";
import { createOrder } from "@/services/orderService";

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  const addItem = (product: Product, quantity = 1) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find(item => item.product.id === product.id);
      
      if (existingItem) {
        return prevItems.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + quantity } 
            : item
        );
      } else {
        return [...prevItems, { product, quantity }];
      }
    });
    
    toast({
      title: "Added to cart",
      description: `${quantity} × ${product.name} added to your cart`,
      duration: 3000,
    });
  };

  const removeItem = (productId: string) => {
    setItems((prevItems) => prevItems.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    
    setItems((prevItems) => 
      prevItems.map(item => 
        item.product.id === productId 
          ? { ...item, quantity } 
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  // Create an order from the cart
  const checkout = async (
    userId: string,
    deliveryAddress: Order["deliveryAddress"],
    deliveryMethod: Order["deliveryMethod"],
    paymentMethod: Order["paymentMethod"],
    notes?: string
  ) => {
    if (items.length === 0) {
      throw new Error("Cannot checkout with an empty cart");
    }

    const orderItems: OrderItem[] = items.map(item => ({
      productId: item.product.id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      image: item.product.image
    }));

    const subtotal = total;
    const deliveryFee = deliveryMethod.price;
    const orderTotal = subtotal + deliveryFee;

    const estimatedDelivery = deliveryMethod.estimatedDelivery;

    const orderData = {
      userId,
      items: orderItems,
      status: "pending" as const,
      deliveryAddress,
      deliveryMethod,
      paymentMethod,
      subtotal,
      deliveryFee,
      total: orderTotal,
      notes,
      estimatedDelivery,
      tracking: {
        events: [
          {
            status: "pending" as const,
            timestamp: new Date().toISOString(),
            description: "Order placed"
          }
        ]
      }
    };

    const order = await createOrder(orderData);
    clearCart();
    return order;
  };

  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  
  const total = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity, 
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        openCart,
        closeCart,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        checkout,
        itemCount,
        total
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
