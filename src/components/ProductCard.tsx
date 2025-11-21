import { useState } from "react";
import { Product } from "@/types";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useComparison } from "@/context/ComparisonContext";
import { Heart, ShoppingCart, Eye, GitCompare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/utils/currencyFormatter";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { QuickViewModal } from "@/components/product/QuickViewModal";

interface ProductCardProps {
  product: Product;
  className?: string;
}

const ProductCard = ({ product, className }: ProductCardProps) => {
  const { addItem } = useCart();
  const { addItem: addToWishlist, isInWishlist } = useWishlist();
  const { addToComparison, isInComparison, comparisonItems } = useComparison();
  const navigate = useNavigate();
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  const getImageUrl = (imageData: string) => {
    if (!imageData) return '/placeholder.svg';
    if (imageData.startsWith('data:')) return imageData;
    if (imageData.startsWith('http') || imageData.startsWith('/')) return imageData;
    return `data:image/jpeg;base64,${imageData}`;
  };

  const getDiscountedPrice = () => {
    if (!product.discountPercentage) return product.price;
    const discount = (product.price * product.discountPercentage) / 100;
    return product.price - discount;
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(product, 1);
    toast(`${product.name} added to cart`);
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToWishlist(product);
    toast(isInWishlist(product.id) ? "Removed from wishlist" : "Added to wishlist");
  };

  const handleCompareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (comparisonItems.length >= 4 && !isInComparison(product.id)) {
      toast.error("Maximum 4 products can be compared");
      return;
    }
    addToComparison(product);
    toast.success("Added to comparison");
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuickViewOpen(true);
  };

  return (
    <>
      <Card 
        className={`group overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-2 hover:border-primary/20 rounded-2xl ${className || ''}`}
        onClick={() => navigate(`/product/${product.id}`)}
      >
        <div className="relative aspect-square overflow-hidden bg-muted/30">
          <img
            src={getImageUrl(product.image)}
            alt={product.name}
            className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Action Buttons */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="secondary"
              size="icon"
              className="h-9 w-9 rounded-full shadow-md"
              onClick={handleWishlistClick}
            >
              <Heart 
                className={`h-4 w-4 transition-all ${isInWishlist(product.id) ? 'fill-red-500 text-red-500' : ''}`} 
              />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="h-9 w-9 rounded-full shadow-md"
              onClick={handleQuickView}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="h-9 w-9 rounded-full shadow-md"
              onClick={handleCompareClick}
            >
              <GitCompare className={`h-4 w-4 ${isInComparison(product.id) ? 'text-primary' : ''}`} />
            </Button>
          </div>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.discountPercentage && (
              <div className="bg-gradient-to-br from-red-500 to-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                -{product.discountPercentage}% OFF
              </div>
            )}
            {product.featured && (
              <div className="bg-gradient-to-br from-primary to-primary/80 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                Featured
              </div>
            )}
            {product.stock < 10 && product.stock > 0 && (
              <div className="bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                Only {product.stock} left
              </div>
            )}
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-base mb-2 line-clamp-2 min-h-[2.5rem]">{product.name}</h3>
          
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1">
              <span className="text-yellow-500">⭐</span>
              <span className="text-sm font-medium">{product.rating || 0}</span>
              <span className="text-xs text-muted-foreground">({product.numReviews || 0})</span>
            </div>
          </div>

          <div className="flex items-end justify-between gap-2 mb-3">
            <div>
              <p className="font-bold text-xl text-primary">{formatCurrency(getDiscountedPrice())}</p>
              {product.discountPercentage && (
                <p className="text-sm text-muted-foreground line-through">
                  {formatCurrency(product.price)}
                </p>
              )}
            </div>
            <div className={`text-xs font-semibold px-2 py-1 rounded-full ${
              product.stock > 0 ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'
            }`}>
              {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
            </div>
          </div>

          <Button 
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className="w-full h-10 rounded-xl font-semibold"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add to Cart
          </Button>
        </div>
      </Card>

      <QuickViewModal 
        productId={product.id}
        isOpen={quickViewOpen}
        onClose={() => setQuickViewOpen(false)}
      />
    </>
  );
};

export default ProductCard;
