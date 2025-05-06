
import { Link } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductType } from "@/types/supabase";
import { formatCurrency } from "@/utils/currencyFormatter";
import { ShoppingCart, Heart, Star } from "lucide-react";
import { toast } from "sonner";
import { Product } from "@/types";

interface ProductCardProps {
  product: ProductType;
  className?: string;
}

const ProductCard = ({ product, className }: ProductCardProps) => {
  const { addItem } = useCart();
  const { addItem: addToWishlist, isInWishlist } = useWishlist();

  // First image if multiple images
  const mainImage = product.image ? product.image.split(',')[0].trim() : '/placeholder.svg';
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (product.stock <= 0) {
      toast.error("Product out of stock", {
        description: "This product is currently unavailable"
      });
      return;
    }
    
    // Convert to Product type expected by cart
    const cartProduct: Product = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: mainImage,
      description: product.description || "",
      category: product.category || "",
      stock: product.stock || 0,
      featured: product.featured || false,
      rating: product.rating || 0,
      numReviews: product.numReviews || product.num_reviews || 0,
      discountPercentage: product.discountPercentage || 0
    };
    
    addItem(cartProduct, 1);
    
    toast.success("Added to cart", {
      description: `${product.name} has been added to your cart`
    });
  };
  
  const handleAddToWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Convert to Product type expected by wishlist
    const wishlistProduct: Product = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: mainImage,
      description: product.description || "",
      category: product.category || "",
      stock: product.stock || 0,
      featured: product.featured || false,
      rating: product.rating || 0,
      numReviews: product.numReviews || product.num_reviews || 0,
      discountPercentage: product.discountPercentage || 0
    };
    
    addToWishlist(wishlistProduct);
    
    toast.success("Added to wishlist", {
      description: `${product.name} has been added to your wishlist`
    });
  };
  
  const wishlistActive = isInWishlist(product.id);
  
  return (
    <Link to={`/products/${product.id}`} className={`group ${className || ''}`}>
      <div className="border rounded-lg overflow-hidden transition-all hover:shadow-md">
        <div className="relative h-48 bg-gray-100">
          {/* Product image */}
          <img
            src={mainImage}
            alt={product.name}
            className="w-full h-full object-cover object-center"
          />
          
          {/* Discount badge */}
          {product.discountPercentage && product.discountPercentage > 0 && (
            <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-600">
              {product.discountPercentage}% OFF
            </Badge>
          )}
          
          {/* Wishlist button */}
          <Button
            size="icon"
            variant="ghost"
            onClick={handleAddToWishlist}
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
        
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-medium text-lg line-clamp-1 group-hover:text-primary transition-colors">
              {product.name}
            </h3>
          </div>
          
          {/* Rating */}
          <div className="flex items-center mb-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3.5 w-3.5 ${
                  i < Math.round(product.rating)
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-gray-300"
                }`}
              />
            ))}
            <span className="text-xs text-gray-500 ml-1">
              ({product.numReviews || product.num_reviews || 0})
            </span>
          </div>
          
          {/* Price */}
          <div className="flex items-center justify-between">
            <div>
              {product.discountPercentage && product.discountPercentage > 0 ? (
                <div className="flex items-center gap-1.5">
                  <span className="font-bold">
                    {formatCurrency(product.price * (1 - product.discountPercentage / 100))}
                  </span>
                  <span className="text-sm text-gray-500 line-through">
                    {formatCurrency(product.price)}
                  </span>
                </div>
              ) : (
                <span className="font-bold">{formatCurrency(product.price)}</span>
              )}
            </div>
            
            {/* Add to cart button */}
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="sr-only">Add to cart</span>
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
