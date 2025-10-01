
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
      <Button
        size="sm"
        onClick={onAddToCart}
        disabled={product.stock <= 0}
        className="w-full text-sm h-10 touch-manipulation bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl font-medium"
      >
        <ShoppingCart className="h-4 w-4 mr-2" />
        Add to Cart
      </Button>
    </div>
  );
};

export default ProductCardActions;
