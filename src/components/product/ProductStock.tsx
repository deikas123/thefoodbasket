
import { Badge } from "@/components/ui/badge";
import { Check, Timer, TruckIcon } from "lucide-react";
import { ProductType } from "@/types/supabase";

interface ProductStockProps {
  product: ProductType;
}

const ProductStock = ({ product }: ProductStockProps) => {
  const stockStatus = () => {
    if (product.stock > 20) {
      return { text: 'In Stock', className: 'bg-green-100 text-green-800' };
    } else if (product.stock > 0) {
      return { text: `Only ${product.stock} left!`, className: 'bg-orange-100 text-orange-800' };
    } else {
      return { text: 'Out of Stock', className: 'bg-red-100 text-red-800' };
    }
  };
  
  const { text: stockText, className: stockClass } = stockStatus();

  return (
    <div className="space-y-3">
      {/* Stock status */}
      <Badge className={stockClass} variant="outline">
        <span className="flex items-center gap-1">
          {product.stock > 0 ? <Check className="h-3 w-3" /> : <Timer className="h-3 w-3" />}
          {stockText}
        </span>
      </Badge>
      
      {/* Delivery estimate */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <TruckIcon className="h-4 w-4" />
        <span>Delivery: 2-4 Business Days</span>
      </div>
    </div>
  );
};

export default ProductStock;
