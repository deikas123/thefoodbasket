import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getProductById } from "@/services/productService";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/context/CartContext";
import { useNavigate } from "react-router-dom";
import { formatCurrency } from "@/utils/currencyFormatter";
import { Product } from "@/types";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Eye, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

interface QuickViewModalProps {
  productId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const QuickViewModal = ({ productId, isOpen, onClose }: QuickViewModalProps) => {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);

  const productQuery = useQuery({
    queryKey: ["product", productId],
    queryFn: () => getProductById(productId || ""),
    enabled: !!productId && isOpen
  });

  const storeQuery = useQuery({
    queryKey: ["product-store", productId],
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("stores!inner(name, logo)")
        .eq("id", productId)
        .single();
      return data?.stores ? (Array.isArray(data.stores) ? data.stores[0] : data.stores) : null;
    },
    enabled: !!productId && isOpen
  });

  const product = productQuery.data;
  const store = storeQuery.data as { name: string; logo: string | null } | null;

  const getImageUrl = (imageData: string) => {
    if (!imageData) return '/placeholder.svg';
    if (imageData.startsWith('data:')) return imageData;
    if (imageData.startsWith('http') || imageData.startsWith('/')) return imageData;
    return `data:image/jpeg;base64,${imageData}`;
  };

  const getDiscountedPrice = () => {
    if (!product?.discountPercentage) return product?.price || 0;
    const discount = (product.price * product.discountPercentage) / 100;
    return product.price - discount;
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    const cartProduct: Product = {
      id: product.id,
      name: product.name,
      price: getDiscountedPrice(),
      image: getImageUrl(product.image),
      description: product.description || "",
      category: product.category || "",
      stock: product.stock || 0,
      featured: product.featured || false,
      rating: product.rating || 0,
      numReviews: product.num_reviews || 0,
      discountPercentage: product.discountPercentage || 0
    };
    
    addItem(cartProduct, quantity);
    toast.success(`${quantity} × ${product.name} added to cart`);
    onClose();
  };

  const handleViewFullDetails = () => {
    navigate(`/product/${productId}`);
    onClose();
  };

  if (!product) {
    return null;
  }

  const inStock = product.stock > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <div className="grid md:grid-cols-2 gap-6 p-6">
          {/* Image Section */}
          <div className="space-y-4">
            <div className="aspect-square bg-muted rounded-2xl overflow-hidden relative">
              <img 
                src={getImageUrl(product.image)} 
                alt={product.name}
                className="w-full h-full object-contain p-4"
              />
              {product.discountPercentage && (
                <div className="absolute top-4 right-4 bg-gradient-to-br from-red-500 to-red-600 text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-lg">
                  -{product.discountPercentage}% OFF
                </div>
              )}
            </div>
            
            {store && (
              <div className="flex items-center gap-3 p-3 bg-card rounded-xl border">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                  {store.logo ? (
                    <img src={store.logo} alt={store.name} className="w-full h-full object-contain p-1" />
                  ) : (
                    <div className="text-xs font-bold">{store.name?.[0]}</div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{store.name}</p>
                  <p className="text-xs text-muted-foreground">Seller</p>
                </div>
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">{product.name}</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {product.description}
              </p>
            </div>

            <div className="flex items-baseline gap-3">
              <p className="text-3xl font-bold text-primary">{formatCurrency(getDiscountedPrice())}</p>
              {product.discountPercentage && (
                <p className="text-lg text-muted-foreground line-through">
                  {formatCurrency(product.price)}
                </p>
              )}
            </div>

            <div className="flex items-center gap-4 text-sm">
              <div className={`px-3 py-1.5 rounded-full font-semibold ${inStock ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
                {inStock ? `✓ In Stock (${product.stock})` : '✗ Out of Stock'}
              </div>
              {product.rating > 0 && (
                <div className="flex items-center gap-1">
                  <span className="font-semibold">{product.rating}</span>
                  <span className="text-yellow-500">⭐</span>
                  <span className="text-muted-foreground">({product.num_reviews || 0})</span>
                </div>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-3 bg-muted/50 rounded-xl p-3">
              <span className="text-sm font-medium">Quantity:</span>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="h-9 w-9 rounded-full"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="font-bold text-lg w-12 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock}
                  className="h-9 w-9 rounded-full"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <Button 
                onClick={handleAddToCart}
                disabled={!inStock}
                className="w-full h-12 rounded-xl font-semibold"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add to Cart
              </Button>
              
              <Button 
                onClick={handleViewFullDetails}
                variant="outline"
                className="w-full h-12 rounded-xl font-semibold"
              >
                <Eye className="h-5 w-5 mr-2" />
                View Full Details
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
