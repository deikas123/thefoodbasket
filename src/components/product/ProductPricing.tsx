
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/utils/currencyFormatter";
import { ProductType } from "@/types/supabase";

interface ProductPricingProps {
  product: ProductType;
  getDiscountedPrice: () => number;
}

const ProductPricing = ({ product, getDiscountedPrice }: ProductPricingProps) => {
  const unitDisplay = product.unit && product.unit !== 'piece' ? `/${product.unit}` : '';
  
  return (
    <div className="text-right">
      {product.discountPercentage ? (
        <div className="space-y-1">
          <div className="text-2xl font-bold text-primary">
            {formatCurrency(getDiscountedPrice())}{unitDisplay}
          </div>
          <div className="text-sm line-through text-muted-foreground">
            {formatCurrency(product.price)}
          </div>
          <Badge variant="destructive" className="text-xs">
            {product.discountPercentage}% OFF
          </Badge>
        </div>
      ) : (
        <div className="text-2xl font-bold text-primary">
          {formatCurrency(product.price)}{unitDisplay}
        </div>
      )}
    </div>
  );
};

export default ProductPricing;
