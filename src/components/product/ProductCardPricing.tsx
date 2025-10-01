
import { formatCurrency } from "@/utils/currencyFormatter";
import { ProductType } from "@/types/supabase";

interface ProductCardPricingProps {
  product: ProductType;
  getDiscountedPrice: () => number;
}

const ProductCardPricing = ({ product, getDiscountedPrice }: ProductCardPricingProps) => {
  return (
    <div className="mb-3">
      {product.discountPercentage && product.discountPercentage > 0 ? (
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-accent">
            {formatCurrency(getDiscountedPrice())}
          </span>
          <span className="text-sm text-muted-foreground line-through">
            {formatCurrency(product.price)}
          </span>
        </div>
      ) : (
        <span className="text-lg font-bold text-accent">{formatCurrency(product.price)}</span>
      )}
    </div>
  );
};

export default ProductCardPricing;
