
import { Button } from "@/components/ui/button";
import { DynamicBadge } from "@/components/ui/dynamic-badge";
import { Heart } from "lucide-react";
import { ProductType } from "@/types/supabase";

interface ProductCardImageProps {
  product: ProductType;
  mainImage: string;
  wishlistActive: boolean;
  onAddToWishlist: (e: React.MouseEvent) => void;
}

const ProductCardImage = ({ 
  product, 
  mainImage, 
  wishlistActive, 
  onAddToWishlist 
}: ProductCardImageProps) => {
  return (
    <div className="relative h-48 bg-gray-100">
      {/* Product image with error handling */}
      <img
        src={mainImage}
        alt={product.name}
        className="w-full h-full object-cover object-center"
        onError={(e) => {
          console.log('Image failed to load:', mainImage);
          e.currentTarget.src = '/placeholder.svg';
        }}
        onLoad={() => {
          console.log('Image loaded successfully:', mainImage);
        }}
      />
      
      {/* Dynamic discount badge */}
      {product.discountPercentage && product.discountPercentage > 0 && (
        <DynamicBadge 
          className="absolute top-2 left-2"
          imageUrl={mainImage}
        >
          {product.discountPercentage}% OFF
        </DynamicBadge>
      )}
      
      {/* Wishlist button */}
      <Button
        size="icon"
        variant="ghost"
        onClick={onAddToWishlist}
        className="absolute top-2 right-2 bg-white/80 hover:bg-white h-8 w-8 rounded-full"
      >
        <Heart 
          className={`h-4 w-4 ${wishlistActive ? 'fill-red-500 text-red-500' : ''}`} 
        />
      </Button>
      
      {/* Out of stock overlay */}
      {product.stock <= 0 && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
          <span className="bg-black px-3 py-1 text-white text-sm font-medium rounded">
            Out of Stock
          </span>
        </div>
      )}
    </div>
  );
};

export default ProductCardImage;
