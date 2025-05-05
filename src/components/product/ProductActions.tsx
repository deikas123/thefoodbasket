
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Heart, 
  HeartOff, 
  Loader2, 
  Minus, 
  Plus, 
  ShoppingCart 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { toast } from "@/hooks/use-toast";
import { convertToProduct } from "@/utils/typeConverters";
import AddToAutoReplenishButton from "@/components/product/AddToAutoReplenishButton";

interface ProductActionsProps {
  product: {
    id: string;
    name: string;
    stock: number;
  } & Record<string, any>;
}

const ProductActions = ({ product }: ProductActionsProps) => {
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  
  const { addItem } = useCart();
  const { addItem: addToWishlist, isInWishlist, removeItem: removeFromWishlist } = useWishlist();

  const incrementQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity(quantity + 1);
    } else {
      toast({
        title: "Maximum quantity reached",
        description: "You've reached the maximum available quantity for this product.",
        variant: "destructive"
      });
    }
  };
  
  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  
  const handleAddToCart = async () => {
    if (product) {
      setIsAddingToCart(true);
      try {
        addItem(convertToProduct(product), quantity);
        toast({
          title: "Added to cart",
          description: `${quantity} × ${product.name} added to your cart`,
          variant: "default",
        });
      } finally {
        setIsAddingToCart(false);
      }
    }
  };
  
  const handleBuyNow = () => {
    if (product) {
      addItem(convertToProduct(product), quantity);
      navigate('/checkout');
    }
  };
  
  const toggleWishlist = () => {
    if (!product) return;
    
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
      toast({
        title: "Removed from wishlist",
        description: `${product.name} has been removed from your wishlist`,
        variant: "default",
      });
    } else {
      addToWishlist(convertToProduct(product));
      toast({
        title: "Added to wishlist",
        description: `${product.name} has been added to your wishlist`,
        variant: "default",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="quantity" className="block text-sm font-medium">
          Quantity
        </label>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={decrementQuantity}
            disabled={quantity <= 1 || product.stock === 0}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-12 text-center">{quantity}</span>
          <Button
            variant="outline"
            size="icon"
            onClick={incrementQuantity}
            disabled={quantity >= product.stock || product.stock === 0}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-3 mt-8">
        <Button
          className="gap-2"
          onClick={handleAddToCart}
          disabled={isAddingToCart || product.stock === 0}
        >
          {isAddingToCart ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Adding...
            </>
          ) : (
            <>
              <ShoppingCart className="h-4 w-4" />
              Add to Cart
            </>
          )}
        </Button>

        <Button
          variant="secondary"
          className="gap-2"
          onClick={handleBuyNow}
          disabled={product.stock === 0}
        >
          Buy Now
        </Button>

        <Button
          variant={isInWishlist(product.id) ? "default" : "outline"}
          className="gap-2"
          onClick={toggleWishlist}
        >
          {isInWishlist(product.id) ? (
            <>
              <HeartOff className="h-4 w-4" />
              Remove from Wishlist
            </>
          ) : (
            <>
              <Heart className="h-4 w-4" />
              Add to Wishlist
            </>
          )}
        </Button>
        
        <AddToAutoReplenishButton 
          productId={product.id} 
          productName={product.name} 
        />
      </div>
    </div>
  );
};

export default ProductActions;
