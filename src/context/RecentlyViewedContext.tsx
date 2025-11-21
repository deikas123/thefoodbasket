import React, { createContext, useContext, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

interface RecentlyViewedContextType {
  trackProductView: (productId: string) => Promise<void>;
}

const RecentlyViewedContext = createContext<RecentlyViewedContextType | undefined>(undefined);

export const RecentlyViewedProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const trackProductView = async (productId: string) => {
    if (!user) {
      // Store in localStorage for anonymous users
      const viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
      const filtered = viewed.filter((id: string) => id !== productId);
      filtered.unshift(productId);
      localStorage.setItem('recentlyViewed', JSON.stringify(filtered.slice(0, 10)));
      return;
    }

    try {
      // Upsert for authenticated users
      const { error } = await supabase
        .from('recently_viewed_products')
        .upsert({
          user_id: user.id,
          product_id: productId,
          viewed_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,product_id'
        });

      if (error) console.error('Error tracking product view:', error);
    } catch (error) {
      console.error('Error tracking product view:', error);
    }
  };

  return (
    <RecentlyViewedContext.Provider value={{ trackProductView }}>
      {children}
    </RecentlyViewedContext.Provider>
  );
};

export const useRecentlyViewed = () => {
  const context = useContext(RecentlyViewedContext);
  if (!context) {
    throw new Error("useRecentlyViewed must be used within RecentlyViewedProvider");
  }
  return context;
};
