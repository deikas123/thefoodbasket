import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/types";
import { Sparkles } from "lucide-react";

interface SmartRecommendationsProps {
  productId?: string;
  title?: string;
  limit?: number;
}

export const SmartRecommendations = ({ 
  productId, 
  title = "Recommended For You",
  limit = 8 
}: SmartRecommendationsProps) => {
  const { user } = useAuth();

  const { data: recommendations, isLoading } = useQuery({
    queryKey: ['smart-recommendations', user?.id, productId, limit],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_product_recommendations', {
        p_user_id: user?.id || null,
        p_product_id: productId || null,
        p_limit: limit
      });

      if (error) throw error;

      if (!data || data.length === 0) return [];

      // Fetch full product details
      const productIds = data.map((r: any) => r.product_id);
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*')
        .in('id', productIds);

      if (productsError) throw productsError;

      // Sort by recommendation score
      return data.map((rec: any) => {
        const product = products?.find(p => p.id === rec.product_id);
        return product ? {
          ...product,
          recommendation_score: rec.recommendation_score
        } : null;
      }).filter(Boolean);
    }
  });

  if (isLoading || !recommendations || recommendations.length === 0) {
    return null;
  }

  return (
    <div className="py-8">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">{title}</h2>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {recommendations.map((product: any) => (
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
