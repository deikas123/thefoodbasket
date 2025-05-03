
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { Button } from '@/components/ui/button';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/utils/currencyFormatter';
import { Product } from '@/types';

export interface ProductCardProps {
  product: Product;
  className?: string;
}

const ProductCard = ({ product, className }: ProductCardProps) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  
  // Calculate discounted price if there's a discount percentage
  const discountedPrice = product.discountPercentage
    ? product.price * (1 - product.discountPercentage / 100)
    : null;

  const handleAddToCart = () => {
    setIsAddingToCart(true);
    
    addToCart({
      ...product,
      quantity: 1
    });
    
    // Reset button after animation
    setTimeout(() => {
      setIsAddingToCart(false);
    }, 600);
  };

  const isWishlisted = isInWishlist(product.id);

  return (
    <div className={cn("group relative flex flex-col overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800 hover:shadow-md transition-shadow duration-300", className)}>
      {/* Wishlist button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-2 z-10 h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm dark:bg-gray-950/80 transition-colors hover:text-red-500"
        onClick={() => toggleWishlist(product)}
      >
        <Heart
          className={cn(
            "h-4 w-4",
            isWishlisted ? "fill-red-500 text-red-500" : ""
          )}
        />
        <span className="sr-only">Add to wishlist</span>
      </Button>
      
      {/* Product image and discount badge */}
      <div className="aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800 relative">
        <Link to={`/product/${product.id}`}>
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </Link>
        {product.discountPercentage > 0 && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
            {product.discountPercentage}% OFF
          </div>
        )}
      </div>
      
      {/* Product details */}
      <div className="flex flex-col flex-grow p-4">
        <Link to={`/product/${product.id}`} className="flex-grow">
          <h3 className="font-medium text-sm md:text-base line-clamp-2 group-hover:text-primary transition-colors mb-1">
            {product.name}
          </h3>
          
          {/* Rating */}
          <div className="flex items-center gap-1 mt-1 mb-2">
            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {product.rating} ({product.numReviews})
            </span>
          </div>
          
          {/* Price section */}
          <div className="mt-2 flex items-center gap-2">
            {discountedPrice ? (
              <>
                <span className="font-semibold">
                  {formatCurrency(discountedPrice)}
                </span>
                <span className="text-sm text-gray-500 line-through">
                  {formatCurrency(product.price)}
                </span>
              </>
            ) : (
              <span className="font-semibold">{formatCurrency(product.price)}</span>
            )}
          </div>
          
          {/* Stock status */}
          {product.stock <= 0 && (
            <div className="mt-2 text-sm text-red-500">Out of stock</div>
          )}
        </Link>
        
        {/* Add to cart button */}
        <div className="mt-4">
          <Button
            variant={product.stock > 0 ? "default" : "outline"}
            size="sm"
            className="w-full"
            disabled={product.stock <= 0 || isAddingToCart}
            onClick={handleAddToCart}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            {product.stock > 0 ? (
              isAddingToCart ? "Adding..." : "Add to Cart"
            ) : (
              "Out of Stock"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
