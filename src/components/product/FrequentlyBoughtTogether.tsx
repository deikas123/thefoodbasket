import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { formatCurrency } from "@/utils/currencyFormatter";
import { ShoppingCart, Plus } from "lucide-react";
import { toast } from "sonner";
import { Product } from "@/types";

interface FrequentlyBoughtTogetherProps {
  productId: string;
  currentProduct: any;
}

export const FrequentlyBoughtTogether = ({ productId, currentProduct }: FrequentlyBoughtTogetherProps) => {
  const { addItem } = useCart();
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set([productId]));

  const { data: frequentlyBought, isLoading } = useQuery({
    queryKey: ['frequently-bought-together', productId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_frequently_bought_together', {
        p_product_id: productId,
        p_limit: 3
      });

      if (error) throw error;
      if (!data || data.length === 0) return [];

      const productIds = data.map((item: any) => item.product_id);
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*')
        .in('id', productIds);

      if (productsError) throw productsError;

      return data.map((rec: any) => {
        const product = products?.find(p => p.id === rec.product_id);
        return product ? {
          ...product,
          purchase_count: rec.purchase_count,
          confidence_score: rec.confidence_score
        } : null;
      }).filter(Boolean);
    }
  });

  if (isLoading || !frequentlyBought || frequentlyBought.length === 0) {
    return null;
  }

  const allProducts = [
    { ...currentProduct, id: productId },
    ...frequentlyBought
  ];

  const toggleProduct = (id: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(id) && id !== productId) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedProducts(newSelected);
  };

  const getImageUrl = (imageData: string) => {
    if (!imageData) return '/placeholder.svg';
    if (imageData.startsWith('data:')) return imageData;
    if (imageData.startsWith('http') || imageData.startsWith('/')) return imageData;
    return `data:image/jpeg;base64,${imageData}`;
  };

  const getDiscountedPrice = (price: number, discount?: number) => {
    if (!discount) return price;
    return price - (price * discount / 100);
  };

  const totalPrice = allProducts
    .filter(p => selectedProducts.has(p.id))
    .reduce((sum, p) => sum + getDiscountedPrice(p.price, p.discount_percentage), 0);

  const handleAddAllToCart = () => {
    allProducts
      .filter(p => selectedProducts.has(p.id))
      .forEach(product => {
        const cartProduct: Product = {
          id: product.id,
          name: product.name,
          price: getDiscountedPrice(product.price, product.discount_percentage),
          image: getImageUrl(product.image),
          description: product.description || "",
          category: product.category || "",
          stock: product.stock || 0,
          featured: product.featured || false,
          rating: product.rating || 0,
          numReviews: product.num_reviews || 0,
          discountPercentage: product.discount_percentage || 0
        };
        addItem(cartProduct, 1);
      });
    toast.success(`${selectedProducts.size} items added to cart!`);
  };

  return (
    <div className="bg-card rounded-2xl p-6 border">
      <h3 className="font-bold text-xl mb-4">Frequently Bought Together</h3>
      
      <div className="space-y-4">
        {/* Products Grid */}
        <div className="grid md:grid-cols-4 gap-4">
          {allProducts.map((product, index) => (
            <div key={product.id} className="relative">
              {index > 0 && (
                <div className="hidden md:flex absolute -left-6 top-1/2 -translate-y-1/2 z-10">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                    <Plus className="h-4 w-4" />
                  </div>
                </div>
              )}
              
              <div className={`bg-background rounded-xl p-4 border-2 transition-all ${
                selectedProducts.has(product.id) ? 'border-primary' : 'border-border'
              }`}>
                <div className="flex items-start gap-3 mb-3">
                  <Checkbox
                    checked={selectedProducts.has(product.id)}
                    onCheckedChange={() => toggleProduct(product.id)}
                    disabled={product.id === productId}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="aspect-square bg-muted rounded-lg overflow-hidden mb-2">
                      <img 
                        src={getImageUrl(product.image)} 
                        alt={product.name}
                        className="w-full h-full object-contain p-2"
                      />
                    </div>
                    <h4 className="font-semibold text-sm line-clamp-2 mb-2">{product.name}</h4>
                    <div className="text-sm">
                      <span className="font-bold text-primary">
                        {formatCurrency(getDiscountedPrice(product.price, product.discount_percentage))}
                      </span>
                      {product.discount_percentage > 0 && (
                        <span className="text-xs text-muted-foreground line-through ml-2">
                          {formatCurrency(product.price)}
                        </span>
                      )}
                    </div>
                    {product.confidence_score && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {product.confidence_score.toFixed(0)}% buy together
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Total and Add Button */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div>
            <p className="text-sm text-muted-foreground mb-1">
              Total for {selectedProducts.size} items
            </p>
            <p className="text-2xl font-bold text-primary">{formatCurrency(totalPrice)}</p>
          </div>
          
          <Button 
            size="lg"
            onClick={handleAddAllToCart}
            disabled={selectedProducts.size === 0}
            className="gap-2"
          >
            <ShoppingCart className="h-5 w-5" />
            Add Selected to Cart
          </Button>
        </div>
      </div>
    </div>
  );
};
