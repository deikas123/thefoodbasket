import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Heart, MessageCircle, Zap } from "lucide-react";
import { ProductType } from "@/types/supabase";
import { formatCurrency } from "@/utils/currencyFormatter";
import { AutoReplenishButton } from "@/components/product/autoReplenish";
import { useFlyingCart } from "@/hooks/useFlyingCart";

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

  const { flyToCart } = useFlyingCart();
  const addToCartRef = useRef<HTMLButtonElement>(null);

  const getImageUrl = () => {
    const imageData = product.image?.split(',')[0]?.trim() || '';
    if (!imageData || imageData === '/placeholder.svg') return '/placeholder.svg';
    if (imageData.startsWith('data:')) return imageData;
    if (imageData.startsWith('http')) return imageData;
    return imageData;
  };

  const handleAddToCartWithAnimation = () => {
    if (addToCartRef.current) {
      const rect = addToCartRef.current.getBoundingClientRect();
      flyToCart({
        imageUrl: getImageUrl(),
        startX: rect.left + rect.width / 2 - 40,
        startY: rect.top - 80,
        targetSelector: '[data-cart-button]',
      });
    }
    onAddToCart();
  };

  return (
    <div className="space-y-4">
      {/* Main Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          ref={addToCartRef}
          onClick={handleAddToCartWithAnimation}
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

      {/* Auto Replenish Button */}
      <AutoReplenishButton 
        productId={product.id} 
        productName={product.name}
      />

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
