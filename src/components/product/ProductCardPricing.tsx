
import { formatCurrency } from "@/utils/currencyFormatter";
import { ProductType } from "@/types/supabase";

interface ProductCardPricingProps {
  product: ProductType;
  getDiscountedPrice: () => number;
}

const ProductCardPricing = ({ product, getDiscountedPrice }: ProductCardPricingProps) => {
  const unitDisplay = product.unit && product.unit !== 'piece' ? `/${product.unit}` : '';
  
  return (
    <div className="mb-3">
      {product.discountPercentage && product.discountPercentage > 0 ? (
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-accent">
            {formatCurrency(getDiscountedPrice())}
            <span className="text-sm font-normal text-muted-foreground">{unitDisplay}</span>
          </span>
          <span className="text-sm text-muted-foreground line-through">
            {formatCurrency(product.price)}
          </span>
        </div>
      ) : (
        <span className="text-lg font-bold text-accent">
          {formatCurrency(product.price)}
          <span className="text-sm font-normal text-muted-foreground">{unitDisplay}</span>
        </span>
      )}
    </div>
  );
};

export default ProductCardPricing;
