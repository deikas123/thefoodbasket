
import { Button } from "@/components/ui/button";
import { Product } from "@/types";
import { ShoppingCart, Heart } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "@/context/CartContext";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addItem } = useCart();
  const [isHovered, setIsHovered] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
  };

  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };

  return (
    <Link 
      to={`/product/${product.id}`}
      className="group relative block transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="product-card group-hover:border-primary/20 h-full flex flex-col">
        {/* Image container */}
        <div className="product-image-container">
          {!isImageLoaded && (
            <div className="absolute inset-0 bg-gray-200 dark:bg-gray-800 animate-pulse"></div>
          )}
          <img
            src={product.image}
            alt={product.name}
            className={`w-full h-full object-cover transition-all duration-500 ${
              isHovered ? "scale-105" : "scale-100"
            } ${isImageLoaded ? "opacity-100" : "opacity-0"}`}
            onLoad={() => setIsImageLoaded(true)}
          />
          
          {/* Discount badge */}
          {product.discountPercentage && (
            <div className="absolute top-3 left-3 bg-primary text-white text-xs font-medium px-2 py-1 rounded">
              {product.discountPercentage}% OFF
            </div>
          )}
          
          {/* Quick actions */}
          <div className={`absolute bottom-0 left-0 right-0 p-4 transition-all duration-300 ${
            isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}>
            <div className="flex items-center justify-between">
              <Button
                size="sm"
                variant="secondary"
                className="w-full bg-white/90 dark:bg-black/50 backdrop-blur-md button-animation"
                onClick={handleAddToCart}
              >
                <ShoppingCart size={16} className="mr-2" />
                Add to Cart
              </Button>
            </div>
          </div>
        </div>
        
        {/* Product info */}
        <div className="p-4 flex flex-col flex-grow">
          <div className="text-sm text-muted-foreground mb-1">{product.category}</div>
          <h3 className="font-medium text-lg mb-2 truncate">{product.name}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3 flex-grow">
            {product.description}
          </p>
          <div className="flex items-center justify-between mt-auto">
            <span className="font-semibold">{formatPrice(product.price)}</span>
            {product.stock <= 10 && (
              <span className="text-xs text-orange-600 dark:text-orange-400">
                Only {product.stock} left
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
