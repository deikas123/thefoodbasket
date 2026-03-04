import { useState } from "react";
import { Product } from "@/types";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useComparison } from "@/context/ComparisonContext";
import { Heart, Plus, Eye, GitCompare } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    return product.price - (product.price * product.discountPercentage) / 100;
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
      <div
        className={`group bg-card border border-border rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-primary/20 ${className || ''}`}
        onClick={() => navigate(`/product/${product.id}`)}
      >
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-muted/20 p-3">
          <img
            src={getImageUrl(product.image)}
            alt={product.name}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          
          {/* Wishlist Button */}
          <button
            onClick={handleWishlistClick}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-card transition-colors"
          >
            <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
          </button>

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.discountPercentage && (
              <span className="bg-destructive text-destructive-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
                -{product.discountPercentage}%
              </span>
            )}
            {product.featured && (
              <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
                Featured
              </span>
            )}
          </div>

          {/* Quick Actions - visible on hover */}
          <div className="absolute bottom-2 left-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="secondary"
              size="icon"
              className="h-7 w-7 rounded-full shadow-sm"
              onClick={handleQuickView}
            >
              <Eye className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="h-7 w-7 rounded-full shadow-sm"
              onClick={handleCompareClick}
            >
              <GitCompare className={`h-3.5 w-3.5 ${isInComparison(product.id) ? 'text-primary' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Info */}
        <div className="p-3 pt-2">
          <h3 className="font-medium text-sm text-foreground line-clamp-2 min-h-[2.25rem] mb-1.5">
            {product.name}
          </h3>
          
          {/* Rating */}
          <div className="flex items-center gap-1 mb-2">
            <span className="text-yellow-500 text-xs">★</span>
            <span className="text-xs font-medium text-foreground">{product.rating || 0}</span>
            <span className="text-[10px] text-muted-foreground">({product.numReviews || 0})</span>
          </div>

          {/* Price & Add */}
          <div className="flex items-end justify-between gap-1">
            <div>
              <p className="font-bold text-base text-primary leading-tight">{formatCurrency(getDiscountedPrice())}</p>
              {product.discountPercentage && (
                <p className="text-[11px] text-muted-foreground line-through">{formatCurrency(product.price)}</p>
              )}
            </div>
            <Button
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              size="icon"
              className="h-8 w-8 rounded-xl shrink-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <QuickViewModal 
        productId={product.id}
        isOpen={quickViewOpen}
        onClose={() => setQuickViewOpen(false)}
      />
    </>
  );
};

export default ProductCard;
