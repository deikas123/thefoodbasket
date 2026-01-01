
import React, { createContext, useContext, useState, useEffect } from "react";
import { CartContextType, Product, CartItem, Order } from "../types";
import { toast } from "@/components/ui/use-toast";
import { createOrder, CreateOrderInput } from "@/services/orderService";
import { convertToOrder } from "@/utils/typeConverters";
import { supabase } from "@/integrations/supabase/client";

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem('cartItems');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error("Error parsing saved cart:", error);
        localStorage.removeItem('cartItems');
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(items));
  }, [items]);
  
  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  const addItem = (productOrCartItem: Product | CartItem, quantity = 1) => {
    setItems((prevItems) => {
      // Check if we're adding a CartItem or a Product
      const isCartItem = 'quantity' in productOrCartItem;
      const product = isCartItem ? (productOrCartItem as CartItem).product : productOrCartItem as Product;
      const quantityToAdd = isCartItem ? (productOrCartItem as CartItem).quantity : quantity;
      
      const existingItem = prevItems.find(item => item.product.id === product.id);
      
      if (existingItem) {
        return prevItems.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + quantityToAdd } 
            : item
        );
      } else {
        return [...prevItems, { product, quantity: quantityToAdd }];
      }
    });
    
    const product = 'quantity' in productOrCartItem 
      ? (productOrCartItem as CartItem).product 
      : productOrCartItem as Product;
    
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
    localStorage.removeItem('cartItems');
  };

  const checkout = async (
    userId: string,
    deliveryAddress: Order["deliveryAddress"],
    deliveryMethod: Order["deliveryMethod"],
    paymentMethod: Order["paymentMethod"],
    notes?: string
  ): Promise<Order> => {
    try {
      // Import inventory service
      const { validateStock, deductStock } = await import('@/services/inventoryService');
      
      // Validate stock before proceeding
      const stockValidation = await validateStock(items);
      if (!stockValidation.isValid) {
        const errorMessage = stockValidation.insufficientItems.map(item => 
          `${item.productId}: ${item.available} available, ${item.requested} requested`
        ).join('\n');
        throw new Error(`Insufficient stock:\n${errorMessage}`);
      }

      const estimatedDelivery = new Date();
      estimatedDelivery.setDate(estimatedDelivery.getDate() + 2);

      const loyaltyPointsEarned = Math.floor(total);
      const currentTime = new Date().toISOString();
      
      const order: Order = {
        id: Date.now().toString(),
        userId,
        items: items.map(item => ({
          productId: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          image: item.product.image
        })),
        subtotal: total,
        deliveryFee: 5.00,
        total: total + 5.00,
        status: "pending",
        deliveryAddress,
        deliveryMethod,
        paymentMethod,
        estimatedDelivery: estimatedDelivery.toISOString(),
        loyaltyPointsEarned,
        createdAt: currentTime,
        updatedAt: currentTime,
        notes
      };

      // Deduct stock first (before saving order)
      await deductStock(items);

      try {
        // Save order to Supabase and get the real order ID
        const { data: createdOrder, error } = await supabase
          .from('orders')
          .insert({
            user_id: userId,
            items: order.items,
            subtotal: order.subtotal,
            delivery_fee: order.deliveryFee,
            total: order.total,
            status: order.status,
            delivery_address: deliveryAddress,
            delivery_method: deliveryMethod,
            payment_method: paymentMethod,
            estimated_delivery: order.estimatedDelivery,
            loyalty_points_earned: loyaltyPointsEarned,
            notes: notes || null
          })
          .select()
          .single();

        if (error || !createdOrder) {
          console.error('Error saving order:', error);
          throw new Error('Failed to save order');
        }

        // Update the order object with the real Supabase-generated ID
        order.id = createdOrder.id;

        // Award loyalty points
        try {
          const { awardLoyaltyPoints } = await import('@/services/loyaltyPointsService');
          await awardLoyaltyPoints(userId, order.total);
          console.log(`Awarded ${loyaltyPointsEarned} loyalty points for order ${order.id}`);
        } catch (error) {
          console.error('Error awarding loyalty points:', error);
        }

        // Generate receipt after successful order
        try {
          const { generateReceipt } = await import('@/services/receiptService');
          await generateReceipt(order);
        } catch (receiptError) {
          console.error('Error generating receipt:', receiptError);
          // Don't fail the whole order for receipt generation
        }

        clearCart();
        return order;
      } catch (orderError) {
        // If order creation fails, restore the stock
        const { restoreStock } = await import('@/services/inventoryService');
        await restoreStock(items);
        throw orderError;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      throw error;
    }
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
