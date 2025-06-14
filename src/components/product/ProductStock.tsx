
import { Badge } from "@/components/ui/badge";
import { Check, Timer, TruckIcon, Package } from "lucide-react";
import { ProductType } from "@/types/supabase";

interface ProductStockProps {
  product: ProductType;
}

const ProductStock = ({ product }: ProductStockProps) => {
  const stockStatus = () => {
    if (product.stock > 20) {
      return { text: 'In Stock', className: 'bg-green-100 text-green-800', icon: Check };
    } else if (product.stock > 0) {
      return { text: `Only ${product.stock} left!`, className: 'bg-orange-100 text-orange-800', icon: Timer };
    } else {
      return { text: 'Out of Stock', className: 'bg-red-100 text-red-800', icon: Timer };
    }
  };
  
  const { text: stockText, className: stockClass, icon: StockIcon } = stockStatus();

  return (
    <div className="space-y-3">
      {/* Stock status with quantity */}
      <div className="flex items-center gap-3">
        <Badge className={`${stockClass} flex items-center gap-1`} variant="outline">
          <StockIcon className="h-3 w-3" />
          {stockText}
        </Badge>
        
        {/* Detailed stock count */}
        {product.stock > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Package className="h-4 w-4" />
            <span>{product.stock} units available</span>
          </div>
        )}
      </div>
      
      {/* Delivery estimate */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <TruckIcon className="h-4 w-4" />
        <span>Delivery: 2-4 Business Days</span>
      </div>
    </div>
  );
};

export default ProductStock;
