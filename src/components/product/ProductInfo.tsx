
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/utils/currencyFormatter";
import { ProductType } from "@/types/supabase";
import { Heart, ShoppingBag, Check, Timer, TruckIcon } from "lucide-react";
import { toast } from "sonner";
import AddToAutoReplenishButton from "./AddToAutoReplenishButton";
import ProductTags from "./ProductTags";
import { Product } from "@/types";

interface ProductInfoProps {
  product: ProductType;
}

const ProductInfo = ({ product }: ProductInfoProps) => {
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();
  
  const isProductInWishlist = isInWishlist(product.id);
  
  const getDiscountedPrice = () => {
    if (!product.discountPercentage) return product.price;
    const discount = (product.price * product.discountPercentage) / 100;
    return product.price - discount;
  };

  const handleAddToCart = () => {
    // Convert to Product type for cart
    const cartProduct: Product = {
      id: product.id,
      name: product.name,
      price: getDiscountedPrice(),
      image: product.image.split(',')[0].trim(),
      description: product.description,
      category: product.category,
      featured: product.featured,
      rating: product.rating,
      numReviews: product.num_reviews || 0,
      stock: product.stock,
      discountPercentage: product.discountPercentage
    };
    
    addItem(cartProduct, quantity);
    toast("Item added to cart");
  };

  const handleToggleWishlist = () => {
    // Convert to Product type for wishlist
    const wishlistProduct: Product = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image.split(',')[0].trim(),
      description: product.description,
      category: product.category,
      featured: product.featured,
      rating: product.rating,
      numReviews: product.num_reviews || 0,
      stock: product.stock,
      discountPercentage: product.discountPercentage
    };
    
    if (isProductInWishlist) {
      removeFromWishlist(product.id);
      toast("Removed from wishlist");
    } else {
      addToWishlist(wishlistProduct);
      toast("Added to wishlist");
    }
  };
  
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setQuantity(value);
    }
  };
  
  const incrementQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(prev => prev + 1);
    } else {
      toast("Cannot exceed available stock");
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };
  
  const stockStatus = () => {
    if (product.stock > 20) {
      return { text: 'In Stock', className: 'bg-green-100 text-green-800' };
    } else if (product.stock > 0) {
      return { text: `Only ${product.stock} left!`, className: 'bg-orange-100 text-orange-800' };
    } else {
      return { text: 'Out of Stock', className: 'bg-red-100 text-red-800' };
    }
  };
  
  const { text: stockText, className: stockClass } = stockStatus();

  return (
    <div className="space-y-5">
      {/* Product title and rating */}
      <div>
        <h1 className="text-2xl font-bold">{product.name}</h1>
        <div className="flex items-center mt-2 space-x-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <span key={i} className={`text-xl ${i < Math.round(product.rating) ? 'text-yellow-400' : 'text-gray-300'}`}>
                ★
              </span>
            ))}
          </div>
          <span className="text-sm text-muted-foreground">
            {product.num_reviews} Reviews
          </span>
        </div>
      </div>

      {/* Product tags */}
      <ProductTags productId={product.id} />
      
      {/* Price */}
      <div>
        {product.discountPercentage ? (
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-primary">
              {formatCurrency(getDiscountedPrice())}
            </span>
            <span className="text-lg line-through text-muted-foreground">
              {formatCurrency(product.price)}
            </span>
            <Badge variant="destructive">
              {product.discountPercentage}% OFF
            </Badge>
          </div>
        ) : (
          <span className="text-2xl font-bold">{formatCurrency(product.price)}</span>
        )}
      </div>
      
      {/* Stock status */}
      <Badge className={stockClass} variant="outline">
        <span className="flex items-center gap-1">
          {product.stock > 0 ? <Check className="h-3 w-3" /> : <Timer className="h-3 w-3" />}
          {stockText}
        </span>
      </Badge>
      
      {/* Delivery estimate */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <TruckIcon className="h-4 w-4" />
        <span>Delivery: 2-4 Business Days</span>
      </div>
      
      {/* Description */}
      <div>
        <h3 className="text-lg font-medium">Description</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {product.description}
        </p>
      </div>
      
      <Separator />
      
      {/* Quantity selector */}
      <div className="flex items-center space-x-4">
        <span className="font-medium">Quantity:</span>
        <div className="flex items-center">
          <button 
            className="h-8 w-8 rounded-l border border-gray-300 flex items-center justify-center"
            onClick={decrementQuantity}
            disabled={quantity <= 1}
          >
            -
          </button>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={handleQuantityChange}
            className="h-8 w-12 border-t border-b border-gray-300 text-center"
          />
          <button 
            className="h-8 w-8 rounded-r border border-gray-300 flex items-center justify-center"
            onClick={incrementQuantity}
            disabled={quantity >= product.stock}
          >
            +
          </button>
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        <Button 
          size="lg"
          className="flex-1"
          onClick={handleAddToCart}
          disabled={product.stock <= 0}
        >
          <ShoppingBag className="mr-2 h-4 w-4" />
          Add to Cart
        </Button>
        
        <Button 
          variant={isProductInWishlist ? "secondary" : "outline"}
          size="icon"
          onClick={handleToggleWishlist}
        >
          <Heart 
            className={`h-4 w-4 ${isProductInWishlist ? 'fill-current' : ''}`} 
          />
          <span className="sr-only">
            {isProductInWishlist ? "Remove from wishlist" : "Add to wishlist"}
          </span>
        </Button>
        
        <AddToAutoReplenishButton productId={product.id} productName={product.name} />
      </div>
    </div>
  );
};

export default ProductInfo;
