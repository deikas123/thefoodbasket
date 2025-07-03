
import { Star } from "lucide-react";
import { ProductType } from "@/types/supabase";

interface ProductCardInfoProps {
  product: ProductType;
}

const ProductCardInfo = ({ product }: ProductCardInfoProps) => {
  return (
    <>
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-lg line-clamp-1 group-hover:text-primary transition-colors">
          {product.name}
        </h3>
      </div>
      
      {/* Rating */}
      <div className="flex items-center mb-2">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-3.5 w-3.5 ${
              i < Math.round(product.rating)
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
        <span className="text-xs text-gray-500 ml-1">
          ({product.num_reviews || 0})
        </span>
      </div>
      
      {/* Stock quantity display */}
      <div className="mb-2">
        {product.stock > 0 ? (
          <span className={`text-xs font-medium ${
            product.stock <= 5 
              ? 'text-orange-600' 
              : product.stock <= 10 
                ? 'text-yellow-600' 
                : 'text-green-600'
          }`}>
            {product.stock} left in stock
          </span>
        ) : (
          <span className="text-xs font-medium text-red-600">
            Out of stock
          </span>
        )}
      </div>
    </>
  );
};

export default ProductCardInfo;
