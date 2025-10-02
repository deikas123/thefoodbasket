
import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { validateStock } from "@/services/inventoryService";
import { useCart } from "@/context/CartContext";

interface ProductQuantitySelectorProps {
  quantity: number;
  stock: number;
  productId: string;
  unit?: string;
  onQuantityChange: (value: number) => void;
  onUnitChange?: (value: string) => void;
}

const ProductQuantitySelector = ({ 
  quantity, 
  stock, 
  productId,
  unit = 'piece',
  onQuantityChange,
  onUnitChange
}: ProductQuantitySelectorProps) => {
  const { items } = useCart();
  const [availableStock, setAvailableStock] = useState(stock);
  
  // Preset quantity values
  const presetValues = [100, 250, 500, 750];
  const maxValue = Math.min(Math.max(...presetValues), availableStock);

  useEffect(() => {
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

  const handleSliderChange = (value: number[]) => {
    const newQuantity = value[0];
    if (newQuantity <= availableStock) {
      onQuantityChange(newQuantity);
    } else {
      toast.error(`Only ${availableStock} items available in stock`);
    }
  };

  const isOutOfStock = availableStock === 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="font-medium">Quantity</span>
        {isOutOfStock && (
          <span className="text-sm text-destructive">Out of stock</span>
        )}
        {!isOutOfStock && availableStock < 10 && (
          <span className="text-sm text-warning">Only {availableStock} left</span>
        )}
      </div>
      
      <div className="flex items-center gap-4">
        {/* Unit selector */}
        <Select value={unit} onValueChange={onUnitChange} disabled={!onUnitChange}>
          <SelectTrigger className="w-24 h-12 bg-muted">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="kg">kg</SelectItem>
            <SelectItem value="g">g</SelectItem>
            <SelectItem value="piece">piece</SelectItem>
            <SelectItem value="bunch">bunch</SelectItem>
            <SelectItem value="pack">pack</SelectItem>
            <SelectItem value="liter">liter</SelectItem>
            <SelectItem value="ml">ml</SelectItem>
          </SelectContent>
        </Select>

        {/* Add to cart button */}
        <Button 
          size="icon"
          className="h-12 w-12 rounded-md bg-primary hover:bg-primary/90"
          disabled={isOutOfStock}
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>

      {/* Quantity slider with preset values */}
      <div className="space-y-2">
        <Slider
          value={[quantity]}
          onValueChange={handleSliderChange}
          max={maxValue}
          min={1}
          step={1}
          disabled={isOutOfStock}
          className="w-full"
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          {presetValues.map((value) => (
            <button
              key={value}
              onClick={() => onQuantityChange(Math.min(value, availableStock))}
              className="hover:text-foreground transition-colors"
              disabled={isOutOfStock || value > availableStock}
            >
              {value}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductQuantitySelector;
