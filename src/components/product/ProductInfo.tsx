
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/utils/currencyFormatter";
import { ProductType } from "@/types/supabase";
import { toast } from "sonner";
import { Product } from "@/types";
import ProductHeader from "./ProductHeader";
import ProductPricing from "./ProductPricing";
import ProductStock from "./ProductStock";
import ProductDescription from "./ProductDescription";
import ProductQuantitySelector from "./ProductQuantitySelector";
import ProductActions from "./ProductActions";
import ProductBenefits from "./ProductBenefits";

interface ProductInfoProps {
  product: ProductType;
}

const ProductInfo = ({ product }: ProductInfoProps) => {
  const [quantity, setQuantity] = useState(100);
  const [selectedUnit, setSelectedUnit] = useState(product.unit || 'piece');
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

  const handleBuyNow = () => {
    handleAddToCart();
    navigate("/checkout");
  };

  const handleWhatsAppOrder = () => {
    const message = `Hi! I'd like to order:\n\nProduct: ${product.name}\nQuantity: ${quantity}\nPrice: ${formatCurrency(getDiscountedPrice())}\nTotal: ${formatCurrency(getDiscountedPrice() * quantity)}\n\nProduct ID: ${product.id}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
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
  
  return (
    <div className="space-y-5">
      <ProductHeader 
        product={product} 
        price={<ProductPricing product={product} getDiscountedPrice={getDiscountedPrice} />}
      />
      
      <ProductStock product={product} />
      
      <ProductDescription product={product} />
      
      <Separator />
      
      <ProductQuantitySelector
        quantity={quantity}
        stock={product.stock}
        productId={product.id}
        unit={selectedUnit}
        onQuantityChange={setQuantity}
        onUnitChange={setSelectedUnit}
      />
      
      <ProductActions
        product={product}
        quantity={quantity}
        isProductInWishlist={isProductInWishlist}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
        onWhatsAppOrder={handleWhatsAppOrder}
        onToggleWishlist={handleToggleWishlist}
      />

      <ProductBenefits />
    </div>
  );
};

export default ProductInfo;
