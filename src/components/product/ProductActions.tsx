
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart, Minus, Plus, ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { Product } from "@/types";
import { cn } from "@/lib/utils";
import { AutoReplenishButton } from "./autoReplenish";

interface ProductActionsProps {
  product: Product;
  className?: string;
}

const ProductActions = ({ product, className }: ProductActionsProps) => {
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist();
  const isWishlisted = isInWishlist(product.id);

  const handleAddToCart = () => {
    addItem(product, quantity);
  };

  const handleWishlistToggle = () => {
    if (isWishlisted) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const incrementQuantity = () => {
    setQuantity(prev => Math.min(prev + 1, product.stock));
  };

  const decrementQuantity = () => {
    setQuantity(prev => Math.max(prev - 1, 1));
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Quantity Selector */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Quantity:</span>
        <div className="flex items-center border rounded-md">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-none"
            onClick={decrementQuantity}
            disabled={quantity <= 1}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="px-3 py-1 text-center min-w-[3rem] border-x">
            {quantity}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-none"
            onClick={incrementQuantity}
            disabled={quantity >= product.stock}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 gap-3">
        <Button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="w-full"
          size="lg"
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
        </Button>

        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={handleWishlistToggle}
            className="flex-1"
          >
            <Heart 
              className={cn(
                "h-4 w-4 mr-2",
                isWishlisted && "fill-current text-red-500"
              )} 
            />
            {isWishlisted ? "Saved" : "Save"}
          </Button>

          <AutoReplenishButton
            productId={product.id}
            productName={product.name}
          />
        </div>
      </div>

      {/* Stock Status */}
      {product.stock > 0 && product.stock <= 10 && (
        <p className="text-sm text-orange-600">
          Only {product.stock} left in stock
        </p>
      )}
    </div>
  );
};

export default ProductActions;
