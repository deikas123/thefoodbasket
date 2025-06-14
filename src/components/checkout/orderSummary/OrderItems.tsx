
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
      <p className="text-sm text-muted-foreground mb-2">
        {items.length} item{items.length !== 1 && 's'} in cart
      </p>
      
      <div className="max-h-40 overflow-auto space-y-2">
        {items.map(item => (
          <div key={item.product.id} className="flex justify-between text-sm">
            <div className="flex items-center">
              <span className="font-medium">{item.quantity} x</span>
              <span className="ml-2 truncate max-w-[140px]">{item.product.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>{formatCurrency(item.product.price * item.quantity)}</span>
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
        ))}
      </div>
    </div>
  );
};

export default OrderItems;
