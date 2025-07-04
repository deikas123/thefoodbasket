
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Heart, MessageCircle, Zap } from "lucide-react";
import { ProductType } from "@/types/supabase";
import { formatCurrency } from "@/utils/currencyFormatter";

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
  onToggleWishlist,
}: ProductActionsProps) => {
  const getDiscountedPrice = () => {
    if (!product.discountPercentage) return product.price;
    const discount = (product.price * product.discountPercentage) / 100;
    return product.price - discount;
  };

  const handleWhatsAppOrder = () => {
    const message = `Hi! I'd like to order:\n\nProduct: ${product.name}\nQuantity: ${quantity}\nPrice: ${formatCurrency(getDiscountedPrice())}\nTotal: ${formatCurrency(getDiscountedPrice() * quantity)}\n\nProduct ID: ${product.id}`;
    const whatsappUrl = `https://wa.me/254798435685?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="space-y-4">
      {/* Main Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          onClick={onAddToCart}
          className="w-full"
          disabled={product.stock === 0}
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          Add to Cart
        </Button>
        
        <Button
          onClick={onBuyNow}
          variant="outline"
          className="w-full"
          disabled={product.stock === 0}
        >
          <Zap className="w-4 h-4 mr-2" />
          Buy Now
        </Button>
      </div>

      {/* WhatsApp Order Button */}
      <Button
        onClick={handleWhatsAppOrder}
        variant="outline"
        className="w-full bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
        disabled={product.stock === 0}
      >
        <MessageCircle className="w-4 h-4 mr-2" />
        Order via WhatsApp
      </Button>

      <Separator />

      {/* Wishlist Button */}
      <Button
        onClick={onToggleWishlist}
        variant="ghost"
        className="w-full"
      >
        <Heart className={`w-4 h-4 mr-2 ${isProductInWishlist ? 'fill-red-500 text-red-500' : ''}`} />
        {isProductInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
      </Button>
    </div>
  );
};

export default ProductActions;
