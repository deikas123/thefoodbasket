import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/utils/currencyFormatter";
import { ShoppingCart, Sparkles, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { Product } from "@/types";
import { SocialShare } from "@/components/ui/social-share";

export const PersonalizedBundleRecommendations = () => {
  const { user } = useAuth();
  const { addItem } = useCart();

  const { data: recommendations, isLoading } = useQuery({
    queryKey: ['personalized-bundles', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .rpc('get_personalized_bundle_recommendations', {
          p_user_id: user.id,
          p_limit: 6
        });
      
      if (error) throw error;
      
      // Fetch full bundle details
      const bundleIds = data?.map((r: any) => r.bundle_id) || [];
      if (bundleIds.length === 0) return [];
      
      const { data: bundles, error: bundlesError } = await supabase
        .from('product_bundles')
        .select(`
          *,
          bundle_items(
            quantity,
            products(*)
          )
        `)
        .in('id', bundleIds);
      
      if (bundlesError) throw bundlesError;
      
      // Merge with recommendation scores
      return bundles?.map(bundle => ({
        ...bundle,
        recommendation_score: data.find((r: any) => r.bundle_id === bundle.id)?.recommendation_score || 0,
        match_reason: data.find((r: any) => r.bundle_id === bundle.id)?.match_reason || ''
      })) || [];
    },
    enabled: !!user
  });

  if (!user || isLoading || !recommendations || recommendations.length === 0) {
    return null;
  }

  const getImageUrl = (imageData: string) => {
    if (!imageData) return '/placeholder.svg';
    if (imageData.startsWith('data:')) return imageData;
    if (imageData.startsWith('http') || imageData.startsWith('/')) return imageData;
    return `data:image/jpeg;base64,${imageData}`;
  };

  const calculateBundlePrice = (bundle: any) => {
    const regularPrice = bundle.bundle_items?.reduce((sum: number, item: any) => {
      return sum + (item.products?.price || 0) * item.quantity;
    }, 0) || 0;
    
    const discount = (regularPrice * (bundle.discount_percentage || 0)) / 100;
    return {
      regular: regularPrice,
      discounted: regularPrice - discount,
      savings: discount
    };
  };

  const handleAddBundleToCart = (bundle: any) => {
    bundle.bundle_items?.forEach((item: any) => {
      if (item.products) {
        const cartProduct: Product = {
          id: item.products.id,
          name: item.products.name,
          price: item.products.price,
          image: getImageUrl(item.products.image),
          description: item.products.description || "",
          category: item.products.category || "",
          stock: item.products.stock || 0,
          featured: item.products.featured || false,
          rating: item.products.rating || 0,
          numReviews: item.products.num_reviews || 0,
          discountPercentage: item.products.discount_percentage || 0
        };
        addItem(cartProduct, item.quantity);
      }
    });
    toast.success(`Bundle "${bundle.name}" added to cart!`);
  };

  return (
    <div className="py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Recommended For You</h2>
          <p className="text-sm text-muted-foreground">Bundles curated based on your preferences</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((bundle: any) => {
          const pricing = calculateBundlePrice(bundle);
          
          return (
            <Card key={bundle.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {bundle.image && (
                <div className="aspect-video bg-muted relative overflow-hidden">
                  <img 
                    src={getImageUrl(bundle.image)}
                    alt={bundle.name}
                    className="w-full h-full object-cover"
                  />
                  {bundle.discount_percentage > 0 && (
                    <Badge className="absolute top-3 right-3 bg-red-500">
                      Save {bundle.discount_percentage}%
                    </Badge>
                  )}
                  <div className="absolute top-3 left-3">
                    <Badge variant="secondary" className="gap-1.5 bg-background/80 backdrop-blur-sm">
                      <TrendingUp className="h-3 w-3" />
                      {bundle.match_reason}
                    </Badge>
                  </div>
                </div>
              )}
              
              <div className="p-6">
                <h3 className="font-bold text-xl mb-2">{bundle.name}</h3>
                {bundle.description && (
                  <p className="text-sm text-muted-foreground mb-4">{bundle.description}</p>
                )}

                {/* Bundle Items */}
                <div className="mb-4 space-y-2">
                  <p className="text-sm font-semibold">Includes:</p>
                  <div className="max-h-32 overflow-y-auto space-y-2">
                    {bundle.bundle_items?.map((item: any, index: number) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <div className="h-10 w-10 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                          <img 
                            src={getImageUrl(item.products?.image)}
                            alt={item.products?.name}
                            className="w-full h-full object-contain p-1"
                          />
                        </div>
                        <span className="line-clamp-1">
                          {item.quantity}x {item.products?.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pricing */}
                <div className="mb-4 pb-4 border-b">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-primary">
                      {formatCurrency(pricing.discounted)}
                    </span>
                    {bundle.discount_percentage > 0 && (
                      <span className="text-sm text-muted-foreground line-through">
                        {formatCurrency(pricing.regular)}
                      </span>
                    )}
                  </div>
                  {pricing.savings > 0 && (
                    <p className="text-sm text-green-600 font-medium mt-1">
                      You save {formatCurrency(pricing.savings)}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button 
                    className="flex-1 gap-2"
                    onClick={() => handleAddBundleToCart(bundle)}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Add to Cart
                  </Button>
                  <SocialShare
                    title={bundle.name}
                    text={`Check out this personalized bundle: ${bundle.name}! ${bundle.match_reason}`}
                    variant="outline"
                    size="default"
                  />
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
