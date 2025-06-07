
import { Button } from "@/components/ui/button";
import { Heart, ShoppingBag, Zap, MessageCircle } from "lucide-react";
import AddToAutoReplenishButton from "./AddToAutoReplenishButton";
import { ProductType } from "@/types/supabase";

interface ProductActionsProps {
  product: ProductType;
  quantity: number;
  isProductInWishlist: boolean;
  onAddToCart: () => void;
  onBuyNow: () => void;
  onWhatsAppOrder: () => void;
  onToggleWishlist: () => void;
}

const ProductActions = ({
  product,
  quantity,
  isProductInWishlist,
  onAddToCart,
  onBuyNow,
  onWhatsAppOrder,
  onToggleWishlist
}: ProductActionsProps) => {
  return (
    <div className="space-y-3">
      {/* Primary actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button 
          size="lg"
          onClick={onAddToCart}
          disabled={product.stock <= 0}
          variant="outline"
        >
          <ShoppingBag className="mr-2 h-4 w-4" />
          Add to Cart
        </Button>
        
        <Button 
          size="lg"
          onClick={onBuyNow}
          disabled={product.stock <= 0}
        >
          <Zap className="mr-2 h-4 w-4" />
          Buy Now
        </Button>
      </div>

      {/* Secondary actions */}
      <div className="flex gap-3">
        <Button 
          variant={isProductInWishlist ? "secondary" : "outline"}
          size="icon"
          onClick={onToggleWishlist}
        >
          <Heart 
            className={`h-4 w-4 ${isProductInWishlist ? 'fill-current' : ''}`} 
          />
          <span className="sr-only">
            {isProductInWishlist ? "Remove from wishlist" : "Add to wishlist"}
          </span>
        </Button>
        
        <AddToAutoReplenishButton productId={product.id} productName={product.name} />
        
        <Button 
          variant="outline"
          onClick={onWhatsAppOrder}
          className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
        >
          <MessageCircle className="mr-2 h-4 w-4" />
          Order via WhatsApp
        </Button>
      </div>
    </div>
  );
};

export default ProductActions;
