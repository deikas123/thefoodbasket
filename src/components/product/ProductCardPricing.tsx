
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
        <div className="flex items-center gap-1.5">
          <span className="font-bold">
            {formatCurrency(getDiscountedPrice())}
          </span>
          <span className="text-sm text-gray-500 line-through">
            {formatCurrency(product.price)}
          </span>
        </div>
      ) : (
        <span className="font-bold">{formatCurrency(product.price)}</span>
      )}
    </div>
  );
};

export default ProductCardPricing;
