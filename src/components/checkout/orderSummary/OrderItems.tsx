
import { CartItem } from "@/types";
import { formatCurrency } from "@/utils/currencyFormatter";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface OrderItemsProps {
  items: CartItem[];
  onAutoReplenishClick: (item: CartItem) => void;
}

const OrderItems = ({ items, onAutoReplenishClick }: OrderItemsProps) => {
  return (
    <div className="mb-4">
      <p className="text-xs sm:text-sm text-muted-foreground mb-2">
        {items.length} item{items.length !== 1 && 's'} in cart
      </p>
      
      <div className="max-h-48 overflow-auto space-y-2">
        {items.map(item => {
          const hasDiscount = item.product.discountPercentage && item.product.discountPercentage > 0;
          const effectivePrice = hasDiscount 
            ? item.product.price * (1 - (item.product.discountPercentage! / 100))
            : item.product.price;
          const lineTotal = effectivePrice * item.quantity;
          
          return (
            <div key={item.product.id} className="flex justify-between text-sm gap-2">
              <div className="flex items-center min-w-0">
                <span className="font-medium shrink-0">{item.quantity}×</span>
                <span className="ml-1.5 truncate">{item.product.name}</span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {hasDiscount && (
                  <span className="text-xs text-muted-foreground line-through">
                    {formatCurrency(item.product.price * item.quantity)}
                  </span>
                )}
                <span className={hasDiscount ? "text-green-600 font-medium" : ""}>
                  {formatCurrency(lineTotal)}
                </span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6" 
                  title="Set auto-replenish"
                  onClick={() => onAutoReplenishClick(item)}
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderItems;
