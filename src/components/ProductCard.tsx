import { Link } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { ProductType } from "@/types/supabase";
import { formatCurrency } from "@/utils/currencyFormatter";
import { toast } from "sonner";
import { Product } from "@/types";
import { useNavigate } from "react-router-dom";
import ProductCardImage from "./product/ProductCardImage";
import ProductCardInfo from "./product/ProductCardInfo";
import ProductCardPricing from "./product/ProductCardPricing";
import ProductCardActions from "./product/ProductCardActions";

interface ProductCardProps {
  product: ProductType;
  className?: string;
}

const ProductCard = ({ product, className }: ProductCardProps) => {
  const { addItem } = useCart();
  const { addItem: addToWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();

  // Handle image URL - support both base64 and regular URLs
  const getImageUrl = (imageData: string) => {
    if (!imageData) return '/placeholder.svg';
    
    // If it's already a base64 data URL, return as is
    if (imageData.startsWith('data:')) {
      return imageData;
    }
    
    // If it's a regular URL, return as is
    if (imageData.startsWith('http') || imageData.startsWith('/')) {
      return imageData;
    }
    
    // Otherwise, assume it's base64 without the data URL prefix
    return `data:image/jpeg;base64,${imageData}`;
  };

  // First image if multiple images
  const mainImage = getImageUrl(product.image);
  
  const getDiscountedPrice = () => {
    if (!product.discountPercentage) return product.price;
    const discount = (product.price * product.discountPercentage) / 100;
    return product.price - discount;
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (product.stock <= 0) {
      toast("This product is currently unavailable");
      return;
    }
    
    // Convert to Product type expected by cart
    const cartProduct: Product = {
      id: product.id,
      name: product.name,
      price: getDiscountedPrice(),
      image: mainImage,
      description: product.description || "",
      category: product.category || "",
      stock: product.stock || 0,
      featured: product.featured || false,
      rating: product.rating || 0,
      numReviews: product.numReviews || product.num_reviews || 0,
      discountPercentage: product.discountPercentage || 0
    };
    
    addItem(cartProduct, 1);
    toast(`${product.name} has been added to your cart`);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleAddToCart(e);
    navigate("/checkout");
  };

  const handleWhatsAppOrder = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const message = `Hi! I'd like to order:\n\nProduct: ${product.name}\nQuantity: 1\nPrice: ${formatCurrency(getDiscountedPrice())}\n\nProduct ID: ${product.id}`;
    const whatsappUrl = `https://wa.me/254798435685?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };
  
  const handleAddToWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Convert to Product type expected by wishlist
    const wishlistProduct: Product = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: mainImage,
      description: product.description || "",
      category: product.category || "",
      stock: product.stock || 0,
      featured: product.featured || false,
      rating: product.rating || 0,
      numReviews: product.numReviews || product.num_reviews || 0,
      discountPercentage: product.discountPercentage || 0
    };
    
    addToWishlist(wishlistProduct);
    toast(`${product.name} has been added to your wishlist`);
  };
  
  const wishlistActive = isInWishlist(product.id);
  
  return (
    <Link to={`/product/${product.id}`} className={`group ${className || ''}`}>
      <div className="border border-border/40 rounded-2xl overflow-hidden transition-all hover:shadow-xl bg-card/50 backdrop-blur-sm">
        <ProductCardImage
          product={product}
          mainImage={mainImage}
          wishlistActive={wishlistActive}
          onAddToWishlist={handleAddToWishlist}
        />
        
        <div className="p-4">
          <ProductCardInfo product={product} />
          <ProductCardPricing product={product} getDiscountedPrice={getDiscountedPrice} />
          <ProductCardActions
            product={product}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            onWhatsAppOrder={handleWhatsAppOrder}
          />
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
