
import { Button } from "@/components/ui/button";
import { ShoppingCart, Zap, MessageCircle } from "lucide-react";
import { ProductType } from "@/types/supabase";

interface ProductCardActionsProps {
  product: ProductType;
  onAddToCart: (e: React.MouseEvent) => void;
  onBuyNow: (e: React.MouseEvent) => void;
  onWhatsAppOrder: (e: React.MouseEvent) => void;
}

const ProductCardActions = ({ 
  product, 
  onAddToCart, 
  onBuyNow, 
  onWhatsAppOrder 
}: ProductCardActionsProps) => {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={onAddToCart}
          disabled={product.stock <= 0}
          className="text-xs h-9 touch-manipulation"
        >
          <ShoppingCart className="h-4 w-4 mr-1" />
          Add
        </Button>
        <Button
          size="sm"
          onClick={onBuyNow}
          disabled={product.stock <= 0}
          className="text-xs h-9 touch-manipulation bg-primary hover:bg-primary/90"
        >
          <Zap className="h-4 w-4 mr-1" />
          Buy Now
        </Button>
      </div>
      <Button
        size="sm"
        variant="outline"
        onClick={onWhatsAppOrder}
        disabled={product.stock <= 0}
        className="w-full text-xs h-9 touch-manipulation bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
      >
        <MessageCircle className="h-4 w-4 mr-1" />
        WhatsApp Order
      </Button>
    </div>
  );
};

export default ProductCardActions;
