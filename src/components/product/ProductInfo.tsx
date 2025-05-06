import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus, ShoppingCart, Heart, Star, Package, Truck, Clock } from "lucide-react";
import { ProductType } from "@/types/supabase";
import { formatCurrency } from "@/utils/currencyFormatter";
import { toast } from "sonner";
import { Product } from "@/types";
import AddToAutoReplenishButton from "./AddToAutoReplenishButton";

interface ProductInfoProps {
  product: ProductType;
}

const ProductInfo = ({ product }: ProductInfoProps) => {
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const { addItem: addToWishlist, isInWishlist, removeItem: removeFromWishlist } = useWishlist();
  const isProductInWishlist = isInWishlist(product.id);
  
  // Calculate discounted price if applicable
  const discountedPrice = product.discountPercentage 
    ? product.price * (1 - product.discountPercentage / 100) 
    : null;
  
  const increaseQuantity = () => {
    if (quantity < (product.stock || 10)) {
      setQuantity(quantity + 1);
    } else {
      toast("You've reached the maximum available quantity for this product.");
    }
  };
  
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1 && value <= (product.stock || 10)) {
      setQuantity(value);
    }
  };
  
  const handleAddToCart = () => {
    if (product.stock <= 0) {
      toast("This product is currently unavailable");
      return;
    }
    
    // Convert to Product type expected by cart
    const cartProduct: Product = {
      id: product.id,
      name: product.name,
      description: product.description || "",
      price: discountedPrice || product.price,
      image: product.image ? product.image.split(',')[0].trim() : '',
      category: product.category || "",
      stock: product.stock || 0,
      featured: product.featured || false,
      rating: product.rating || 0,
      numReviews: product.numReviews || product.num_reviews || 0,
      discountPercentage: product.discountPercentage || 0,
    };
    
    addItem(cartProduct, quantity);
    
    toast(`${product.name} has been added to your cart`);
  };
  
  const toggleWishlist = () => {
    if (isProductInWishlist) {
      removeFromWishlist(product.id);
      toast(`${product.name} has been removed from your wishlist`);
    } else {
      // Convert to Product type expected by wishlist
      const wishlistProduct: Product = {
        id: product.id,
        name: product.name,
        description: product.description || "",
        price: discountedPrice || product.price,
        image: product.image ? product.image.split(',')[0].trim() : '',
        category: product.category || "",
        stock: product.stock || 0,
        featured: product.featured || false,
        rating: product.rating || 0,
        numReviews: product.numReviews || product.num_reviews || 0,
        discountPercentage: product.discountPercentage || 0
      };
      
      addToWishlist(wishlistProduct);
      toast(`${product.name} has been added to your wishlist`);
    }
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{product.name}</h1>
      
      {/* Rating */}
      <div className="flex items-center">
        <div className="flex mr-2">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-5 w-5 ${
                i < Math.round(product.rating)
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-gray-300"
              }`}
            />
          ))}
        </div>
        <span className="text-sm text-gray-500">
          {product.rating.toFixed(1)} ({product.numReviews || product.num_reviews || 0} reviews)
        </span>
      </div>
      
      {/* Price */}
      <div>
        {discountedPrice ? (
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">{formatCurrency(discountedPrice)}</span>
            <span className="text-gray-500 line-through">{formatCurrency(product.price)}</span>
            <span className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded">
              {product.discountPercentage}% OFF
            </span>
          </div>
        ) : (
          <span className="text-2xl font-bold">{formatCurrency(product.price)}</span>
        )}
      </div>
      
      {/* Stock status */}
      <div>
        {product.stock > 0 ? (
          <p className="text-green-600 flex items-center">
            <Package className="mr-1 h-4 w-4" />
            In Stock ({product.stock} available)
          </p>
        ) : (
          <p className="text-red-600 flex items-center">
            <Package className="mr-1 h-4 w-4" />
            Out of Stock
          </p>
        )}
      </div>
      
      {/* Description */}
      <p className="text-gray-700">{product.description}</p>
      
      {/* Shipping info */}
      <div className="space-y-2">
        <p className="flex items-center text-sm text-gray-600">
          <Truck className="mr-2 h-4 w-4" />
          Free delivery for orders over KSh 2,000
        </p>
        <p className="flex items-center text-sm text-gray-600">
          <Clock className="mr-2 h-4 w-4" />
          Usually dispatched within 24 hours
        </p>
      </div>
      
      {/* Quantity selector and buttons */}
      <div className="space-y-4">
        <div className="flex items-center">
          <span className="mr-4">Quantity:</span>
          <div className="flex items-center">
            <Button 
              variant="outline" 
              size="icon"
              onClick={decreaseQuantity}
              disabled={quantity <= 1}
              className="h-9 w-9"
            >
              <Minus className="h-3 w-3" />
            </Button>
            <Input
              type="number"
              min="1"
              value={quantity}
              onChange={handleQuantityChange}
              className="w-16 h-9 mx-1 text-center"
            />
            <Button 
              variant="outline" 
              size="icon"
              onClick={increaseQuantity}
              disabled={quantity >= (product.stock || 10)}
              className="h-9 w-9"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Button
            size="lg"
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className="flex-1"
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Add to Cart
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            onClick={toggleWishlist}
            className="flex-1"
          >
            <Heart className={`mr-2 h-4 w-4 ${isProductInWishlist ? 'fill-red-500 text-red-500' : ''}`} />
            {isProductInWishlist ? "In Wishlist" : "Add to Wishlist"}
          </Button>
          
          <AddToAutoReplenishButton productId={product.id} productName={product.name} />
        </div>
      </div>
    </div>
  );
};

export default ProductInfo;
