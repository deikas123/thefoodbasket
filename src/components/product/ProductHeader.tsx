
import { ProductType } from "@/types/supabase";
import ProductTags from "./ProductTags";

interface ProductHeaderProps {
  product: ProductType;
}

const ProductHeader = ({ product }: ProductHeaderProps) => {
  return (
    <div>
      {/* Product title and rating */}
      <div>
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

      {/* Product tags */}
      <ProductTags productId={product.id} />
    </div>
  );
};

export default ProductHeader;
