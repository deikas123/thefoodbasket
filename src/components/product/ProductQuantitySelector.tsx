
import { useState, useEffect } from "react";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { validateStock } from "@/services/inventoryService";
import { useCart } from "@/context/CartContext";

interface ProductQuantitySelectorProps {
  quantity: number;
  stock: number;
  productId: string;
  onIncrement: () => void;
  onDecrement: () => void;
}

const ProductQuantitySelector = ({ 
  quantity, 
  stock, 
  productId,
  onIncrement, 
  onDecrement 
}: ProductQuantitySelectorProps) => {
  const { items } = useCart();
  const [availableStock, setAvailableStock] = useState(stock);

  useEffect(() => {
    // Check real-time stock when component mounts or stock changes
    const checkStock = async () => {
      try {
        const cartItem = items.find(item => item.product.id === productId);
        if (cartItem) {
          const stockValidation = await validateStock([cartItem]);
          if (stockValidation.insufficientItems.length > 0) {
            setAvailableStock(stockValidation.insufficientItems[0].available);
          } else {
            setAvailableStock(stock);
          }
        }
      } catch (error) {
        console.error('Error checking stock:', error);
      }
    };

    checkStock();
  }, [stock, items, productId]);

  const handleIncrement = async () => {
    if (quantity < availableStock) {
      onIncrement();
    } else {
      toast.error(`Only ${availableStock} items available in stock`);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      onDecrement();
    }
  };

  const isOutOfStock = availableStock === 0;
  const isAtMaxStock = quantity >= availableStock;

  return (
    <div className="flex items-center space-x-4">
      <span className="font-medium">Quantity:</span>
      <div className="flex items-center border rounded-md">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-none"
          onClick={handleDecrement}
          disabled={quantity <= 1}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <span className="px-3 py-1 text-center min-w-[3rem] border-x">
          {quantity}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-none"
          onClick={handleIncrement}
          disabled={isAtMaxStock || isOutOfStock}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      {isOutOfStock && (
        <span className="text-sm text-destructive">Out of stock</span>
      )}
      {!isOutOfStock && availableStock < 10 && (
        <span className="text-sm text-warning">Only {availableStock} left</span>
      )}
    </div>
  );
};

export default ProductQuantitySelector;
