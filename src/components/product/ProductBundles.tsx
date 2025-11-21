import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/utils/currencyFormatter";
import { ShoppingCart, Package } from "lucide-react";
import { toast } from "sonner";
import { Product } from "@/types";

interface ProductBundlesProps {
  productId?: string;
}

export const ProductBundles = ({ productId }: ProductBundlesProps) => {
  const { addItem } = useCart();

  const { data: bundles, isLoading } = useQuery({
    queryKey: ['product-bundles', productId],
    queryFn: async () => {
      let query = supabase
        .from('product_bundles')
        .select(`
          *,
          bundle_items(
            quantity,
            products(*)
          )
        `)
        .eq('active', true);

      if (productId) {
        // Get bundles that include this product
        const { data: bundleItems } = await supabase
          .from('bundle_items')
          .select('bundle_id')
          .eq('product_id', productId);
        
        if (bundleItems && bundleItems.length > 0) {
          const bundleIds = bundleItems.map(item => item.bundle_id);
          query = query.in('id', bundleIds);
        } else {
          return [];
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  if (isLoading || !bundles || bundles.length === 0) {
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
      <div className="flex items-center gap-2 mb-6">
        <Package className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Product Bundles</h2>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bundles.map((bundle: any) => {
          const pricing = calculateBundlePrice(bundle);
          
          return (
            <Card key={bundle.id} className="overflow-hidden">
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
                  {bundle.bundle_items?.map((item: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <div className="h-10 w-10 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                        <img 
                          src={getImageUrl(item.products?.image)}
                          alt={item.products?.name}
                          className="w-full h-full object-contain p-1"
                        />
                      </div>
                      <span>
                        {item.quantity}x {item.products?.name}
                      </span>
                    </div>
                  ))}
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

                <Button 
                  className="w-full gap-2"
                  onClick={() => handleAddBundleToCart(bundle)}
                >
                  <ShoppingCart className="h-4 w-4" />
                  Add Bundle to Cart
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
