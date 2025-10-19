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
      <div className="bg-card rounded-xl overflow-hidden transition-all hover:shadow-md border relative">
        {/* Product Image */}
        <div className="aspect-square bg-muted relative overflow-hidden">
          <img
            src={mainImage}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {product.discountPercentage && (
            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              -{product.discountPercentage}%
            </div>
          )}
        </div>
        
        {/* Product Info */}
        <div className="p-3">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex-1">
              <p className="font-bold text-lg">{formatCurrency(getDiscountedPrice())}</p>
              {product.discountPercentage && (
                <p className="text-xs text-muted-foreground line-through">
                  {formatCurrency(product.price)}
                </p>
              )}
            </div>
            <button
              onClick={handleAddToCart}
              className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors flex-shrink-0"
            >
              <span className="text-lg font-semibold">+</span>
            </button>
          </div>
          
          <h3 className="text-sm font-medium line-clamp-2 mb-0.5">{product.name}</h3>
          <p className="text-xs text-muted-foreground">Per 1 KG (Pcs)</p>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
