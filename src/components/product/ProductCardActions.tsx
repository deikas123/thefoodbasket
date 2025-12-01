
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { ProductType } from "@/types/supabase";
import { useFlyingCart } from "@/hooks/useFlyingCart";

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
  const { flyToCart } = useFlyingCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    // Get button position for animation start
    const button = e.currentTarget as HTMLElement;
    const rect = button.getBoundingClientRect();
    
    // Trigger flying animation
    flyToCart({
      imageUrl: product.image,
      startX: rect.left + rect.width / 2 - 40,
      startY: rect.top - 80,
      targetSelector: '[data-cart-button]',
    });

    // Call original handler
    onAddToCart(e);
  };

  return (
    <div className="space-y-2">
      <Button
        size="sm"
        onClick={handleAddToCart}
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
