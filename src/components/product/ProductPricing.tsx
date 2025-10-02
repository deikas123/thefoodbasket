
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
    <div>
      {product.discountPercentage ? (
        <div className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-primary">
            {formatCurrency(getDiscountedPrice())}
            <span className="text-lg font-normal text-muted-foreground">{unitDisplay}</span>
          </span>
          <span className="text-lg line-through text-muted-foreground">
            {formatCurrency(product.price)}
          </span>
          <Badge variant="destructive">
            {product.discountPercentage}% OFF
          </Badge>
        </div>
      ) : (
        <span className="text-2xl font-bold">
          {formatCurrency(product.price)}
          <span className="text-lg font-normal text-muted-foreground">{unitDisplay}</span>
        </span>
      )}
    </div>
  );
};

export default ProductPricing;
