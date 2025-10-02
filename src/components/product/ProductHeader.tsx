
import { ProductType } from "@/types/supabase";
import ProductTags from "./ProductTags";

interface ProductHeaderProps {
  product: ProductType;
}

interface ProductHeaderExtendedProps extends ProductHeaderProps {
  price?: React.ReactNode;
}

const ProductHeader = ({ product, price }: ProductHeaderExtendedProps) => {
  return (
    <div>
      {/* Product title and price */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{product.name}</h1>
          <div className="flex items-center mt-2 space-x-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={`text-xl ${i < Math.round(product.rating) ? 'text-yellow-400' : 'text-gray-300'}`}>
                  ★
                </span>
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              {product.num_reviews} Reviews
            </span>
          </div>
        </div>
        {price && <div className="flex-shrink-0">{price}</div>}
      </div>

      {/* Product tags */}
      <ProductTags productId={product.id} />
    </div>
  );
};

export default ProductHeader;
