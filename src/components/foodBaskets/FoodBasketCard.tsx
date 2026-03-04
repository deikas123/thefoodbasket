
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/utils/currencyFormatter";
import { FoodBasket } from "@/types/foodBasket";
import { Product } from "@/types";
import { ShoppingCart, ChefHat, Sparkles, Heart, Clock, Users } from "lucide-react";
import { motion } from "framer-motion";

interface FoodBasketCardProps {
  basket: FoodBasket | any;
  activeTab: string;
  productDetails: {[key: string]: Product};
  onAddToCart: (basket: FoodBasket | any) => void;
  onSaveAIBasket?: (basket: any) => void;
  index?: number;
}

const FoodBasketCard = ({ 
  basket, 
  activeTab, 
  productDetails, 
  onAddToCart, 
  onSaveAIBasket,
  index = 0
}: FoodBasketCardProps) => {
  const getProductName = (productId: string) => {
    return productDetails[productId]?.name || "Loading...";
  };

  const getProductImage = (productId: string) => {
    return productDetails[productId]?.image;
  };

  const isAIGenerated = activeTab === "ai-generated";
  const isPersonalized = activeTab === "personalized";

  // Get items array
  const items = basket.items || [];
  const products = basket.products || [];
  const itemCount = items.length || products.length;

  // Get first product image for card hero
  const heroImage = basket.image || 
    (items[0] && getProductImage(items[0].productId)) ||
    (products[0]?.product?.image);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="group relative bg-card rounded-2xl overflow-hidden border border-border/50 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
    >
      {/* Image Section */}
      <div className="relative h-36 sm:h-44 bg-muted overflow-hidden">
        {heroImage ? (
          <img 
            src={heroImage} 
            alt={basket.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[hsl(var(--rally-navy)/0.05)] to-[hsl(var(--rally-amber)/0.1)]">
            <ShoppingCart className="h-10 w-10 text-muted-foreground/40" />
          </div>
        )}
        
        {/* Overlay badges */}
        <div className="absolute top-2.5 left-2.5 flex gap-1.5">
          {isAIGenerated && (
            <Badge className="bg-[hsl(var(--rally-navy))] text-white border-0 text-[10px] sm:text-xs px-2 py-0.5 rounded-full">
              <Sparkles className="h-3 w-3 mr-1" />AI
            </Badge>
          )}
          {isPersonalized && (
            <Badge className="bg-[hsl(var(--rally-red))] text-white border-0 text-[10px] sm:text-xs px-2 py-0.5 rounded-full">
              <Heart className="h-3 w-3 mr-1" />Saved
            </Badge>
          )}
          {!isAIGenerated && !isPersonalized && (
            <Badge className="bg-[hsl(var(--rally-amber))] text-[hsl(var(--rally-navy))] border-0 text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-semibold">
              Recipe Included
            </Badge>
          )}
        </div>

        {/* Save button for AI */}
        {isAIGenerated && onSaveAIBasket && (
          <button 
            onClick={(e) => { e.stopPropagation(); onSaveAIBasket(basket); }}
            className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors shadow-sm"
          >
            <Heart className="h-4 w-4 text-[hsl(var(--rally-red))]" />
          </button>
        )}

        {/* Price tag */}
        <div className="absolute bottom-2.5 right-2.5 bg-white/95 backdrop-blur-sm rounded-xl px-3 py-1.5 shadow-sm">
          <span className="text-base sm:text-lg font-bold text-[hsl(var(--rally-navy))]">
            {formatCurrency(basket.totalPrice ?? basket.total_price ?? 0)}
          </span>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-3.5 sm:p-4">
        <h3 className="font-semibold text-sm sm:text-base text-foreground mb-1 line-clamp-1">
          {basket.name}
        </h3>
        {basket.description && (
          <p className="text-muted-foreground text-xs sm:text-sm line-clamp-2 mb-3">
            {basket.description}
          </p>
        )}

        {/* Meta info */}
        <div className="flex items-center gap-3 text-muted-foreground text-[10px] sm:text-xs mb-3">
          <span className="flex items-center gap-1">
            <ShoppingCart className="h-3 w-3" />
            {itemCount} items
          </span>
          {basket.prep_time && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {basket.prep_time} min
            </span>
          )}
          {basket.servings && (
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {basket.servings} servings
            </span>
          )}
        </div>
        
        {/* Item thumbnails - show product images in a row */}
        <div className="flex items-center gap-1.5 mb-3 overflow-hidden">
          {items.length > 0 ? (
            items.slice(0, 4).map((item: any, i: number) => {
              const img = getProductImage(item.productId);
              return (
                <div key={item.id || i} className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-muted overflow-hidden border border-border/50 shrink-0">
                  {img ? (
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[8px] text-muted-foreground">
                      {getProductName(item.productId).charAt(0)}
                    </div>
                  )}
                </div>
              );
            })
          ) : products.length > 0 ? (
            products.slice(0, 4).map((item: any, i: number) => (
              <div key={i} className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-muted overflow-hidden border border-border/50 shrink-0">
                {item.product.image ? (
                  <img src={item.product.image} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[8px] text-muted-foreground">
                    {item.product.name?.charAt(0)}
                  </div>
                )}
              </div>
            ))
          ) : null}
          {itemCount > 4 && (
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground shrink-0">
              +{itemCount - 4}
            </div>
          )}
        </div>

        {/* Add to cart button */}
        <Button 
          className="w-full rounded-xl h-9 sm:h-10 text-xs sm:text-sm font-medium bg-[hsl(var(--rally-navy))] hover:bg-[hsl(var(--rally-navy)/0.9)] text-white"
          onClick={() => onAddToCart(basket)}
        >
          <ShoppingCart className="mr-1.5 h-3.5 w-3.5" />
          Add to Cart
        </Button>
      </div>
    </motion.div>
  );
};

export default FoodBasketCard;
