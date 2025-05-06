
import React, { createContext, useContext, useState, useEffect } from "react";
import { WishlistContextType, Product, WishlistItem } from "../types";
import { toast } from "sonner";

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<WishlistItem[]>([]);

  // Load wishlist from localStorage on initial load
  useEffect(() => {
    const storedWishlist = localStorage.getItem("wishlist");
    if (storedWishlist) {
      try {
        setItems(JSON.parse(storedWishlist));
      } catch (error) {
        console.error("Failed to parse wishlist from localStorage", error);
      }
    }
  }, []);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(items));
  }, [items]);

  const addItem = (product: Product) => {
    setItems((prevItems) => {
      // Check if product is already in wishlist
      if (prevItems.some(item => item.product.id === product.id)) {
        return prevItems;
      }
      
      // Add new item to wishlist
      const newItem: WishlistItem = {
        product,
        addedAt: new Date().toISOString()
      };
      
      toast({
        description: `${product.name} has been added to your wishlist`
      });
      
      return [...prevItems, newItem];
    });
  };

  const removeItem = (productId: string) => {
    setItems((prevItems) => {
      const filteredItems = prevItems.filter(item => item.product.id !== productId);
      
      if (filteredItems.length < prevItems.length) {
        toast({
          description: "Item has been removed from your wishlist"
        });
      }
      
      return filteredItems;
    });
  };

  const isInWishlist = (productId: string) => {
    return items.some(item => item.product.id === productId);
  };

  const clearWishlist = () => {
    setItems([]);
    toast({
      description: "All items have been removed from your wishlist"
    });
  };

  return (
    <WishlistContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        isInWishlist,
        clearWishlist,
        itemCount: items.length
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = (): WishlistContextType => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};
