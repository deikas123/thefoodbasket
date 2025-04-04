
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useQuery } from "@tanstack/react-query";
import { getCategoryById } from "@/services/productService";
import { formatCurrency } from "@/utils/currencyFormatter";
import { ProductType } from "@/types/supabase";
import { convertToProduct } from "@/utils/typeConverters";

interface ProductCardProps {
  product: ProductType;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addItem } = useCart();
  const { addItem: addToWishlist, isInWishlist, removeItem } = useWishlist();
  const [isAdding, setIsAdding] = useState(false);
  
  // Fetch category name
  const categoryQuery = useQuery({
    queryKey: ['category', product.category],
    queryFn: () => getCategoryById(product.category),
    enabled: !!product.category
  });
  
  const categoryName = categoryQuery.data?.name || '';
  
  const handleAddToCart = () => {
    setIsAdding(true);
    setTimeout(() => {
      addItem(convertToProduct(product));
      setIsAdding(false);
    }, 300);
  };
  
  const toggleWishlist = () => {
    if (isInWishlist(product.id)) {
      removeItem(product.id);
    } else {
      addToWishlist(convertToProduct(product));
    }
  };
  
  // Calculate sale price if there's a discount
  const salePrice = product.discountPercentage
    ? (product.price * (1 - product.discountPercentage / 100)).toFixed(0)
    : null;
  
  return (
    <Card className="overflow-hidden h-full flex flex-col hover:shadow-md transition-shadow duration-300">
      <div className="relative">
        <Link to={`/product/${product.id}`}>
          <div className="aspect-square overflow-hidden bg-gray-100">
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
            />
          </div>
        </Link>
        
        {/* Wishlist button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm hover:bg-white rounded-full"
          onClick={toggleWishlist}
        >
          <Heart 
            className={`h-5 w-5 ${isInWishlist(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
          />
        </Button>
        
        {/* Badges - Enhanced contrast */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.discountPercentage && (
            <Badge className="bg-red-600 text-white font-medium border-red-600">
              {product.discountPercentage}% OFF
            </Badge>
          )}
          
          {product.featured && (
            <Badge variant="outline" className="bg-primary/90 text-white border-primary font-medium shadow-sm">
              Featured
            </Badge>
          )}
          
          {product.stock <= 5 && product.stock > 0 && (
            <Badge variant="outline" className="bg-amber-500 text-white border-amber-500 font-medium">
              Low Stock
            </Badge>
          )}
          
          {product.stock === 0 && (
            <Badge variant="outline" className="bg-gray-700 text-white border-gray-700 font-medium">
              Out of Stock
            </Badge>
          )}
        </div>
      </div>
      
      <CardContent className="pt-4 flex-grow">
        {categoryName && (
          <div className="mb-1">
            <Badge variant="outline" className="text-xs font-normal">
              {categoryName}
            </Badge>
          </div>
        )}
        
        <Link to={`/product/${product.id}`}>
          <h3 className="font-medium text-lg mb-1 leading-tight hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        
        <p className="text-muted-foreground text-sm line-clamp-2 mb-2">
          {product.description}
        </p>
      </CardContent>
      
      <CardFooter className="pt-0 pb-4 flex items-center justify-between">
        <div className="flex flex-col">
          {salePrice ? (
            <>
              <span className="font-bold text-lg">KSh {salePrice}</span>
              <span className="text-sm text-muted-foreground line-through">
                KSh {product.price}
              </span>
            </>
          ) : (
            <span className="font-bold text-lg">KSh {product.price}</span>
          )}
        </div>
        
        <Button 
          onClick={handleAddToCart} 
          disabled={isAdding || product.stock === 0}
          size="sm"
          className="gap-1"
        >
          <ShoppingCart className="h-4 w-4" />
          {isAdding ? 'Adding...' : 'Add'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
