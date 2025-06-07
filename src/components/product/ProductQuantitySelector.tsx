
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";
import { toast } from "sonner";

interface ProductQuantitySelectorProps {
  quantity: number;
  stock: number;
  onIncrement: () => void;
  onDecrement: () => void;
}

const ProductQuantitySelector = ({ 
  quantity, 
  stock, 
  onIncrement, 
  onDecrement 
}: ProductQuantitySelectorProps) => {
  const handleIncrement = () => {
    if (quantity < stock) {
      onIncrement();
    } else {
      toast("Cannot exceed available stock");
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      onDecrement();
    }
  };

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
          disabled={quantity >= stock}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ProductQuantitySelector;
