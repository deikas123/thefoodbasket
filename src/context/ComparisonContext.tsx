import React, { createContext, useContext, useState, useEffect } from "react";
import { Product } from "@/types";

interface ComparisonContextType {
  comparisonItems: Product[];
  addToComparison: (product: Product) => void;
  removeFromComparison: (productId: string) => void;
  clearComparison: () => void;
  isInComparison: (productId: string) => boolean;
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

export const ComparisonProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [comparisonItems, setComparisonItems] = useState<Product[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('comparisonItems');
    if (saved) {
      try {
        setComparisonItems(JSON.parse(saved));
      } catch (error) {
        console.error("Error parsing comparison items:", error);
        localStorage.removeItem('comparisonItems');
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('comparisonItems', JSON.stringify(comparisonItems));
  }, [comparisonItems]);

  const addToComparison = (product: Product) => {
    if (comparisonItems.length >= 4) {
      return;
    }
    if (!comparisonItems.find(item => item.id === product.id)) {
      setComparisonItems([...comparisonItems, product]);
    }
  };

  const removeFromComparison = (productId: string) => {
    setComparisonItems(comparisonItems.filter(item => item.id !== productId));
  };

  const clearComparison = () => {
    setComparisonItems([]);
    localStorage.removeItem('comparisonItems');
  };

  const isInComparison = (productId: string) => {
    return comparisonItems.some(item => item.id === productId);
  };

  return (
    <ComparisonContext.Provider value={{
      comparisonItems,
      addToComparison,
      removeFromComparison,
      clearComparison,
      isInComparison
    }}>
      {children}
    </ComparisonContext.Provider>
  );
};

export const useComparison = () => {
  const context = useContext(ComparisonContext);
  if (!context) {
    throw new Error("useComparison must be used within ComparisonProvider");
  }
  return context;
};
