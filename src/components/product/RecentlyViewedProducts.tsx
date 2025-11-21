import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/types";
import { ChevronRight } from "lucide-react";

export const RecentlyViewedProducts = () => {
  const { user } = useAuth();

  const { data: recentlyViewed } = useQuery({
    queryKey: ['recently-viewed', user?.id],
    queryFn: async () => {
      if (!user) {
        // Get from localStorage for anonymous users
        const viewedIds = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
        if (viewedIds.length === 0) return [];
        
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .in('id', viewedIds)
          .limit(10);
        
        if (error) throw error;
        
        // Sort by the order in localStorage
        return viewedIds.map((id: string) => 
          data?.find(p => p.id === id)
        ).filter(Boolean);
      }

      const { data, error } = await supabase
        .from('recently_viewed_products')
        .select('product_id, products(*)')
        .eq('user_id', user.id)
        .order('viewed_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data?.map(item => item.products).filter(Boolean) || [];
    },
    enabled: true
  });

  if (!recentlyViewed || recentlyViewed.length === 0) {
    return null;
  }

  return (
    <div className="py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Recently Viewed</h2>
        <button className="text-sm text-primary hover:underline font-medium flex items-center gap-1">
          View all <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {recentlyViewed.map((product: any) => (
          <ProductCard 
            key={product.id} 
            product={{
              ...product,
              category: product.category || '',
              numReviews: product.num_reviews
            } as Product} 
          />
        ))}
      </div>
    </div>
  );
};
