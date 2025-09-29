
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
            className={`h-4 w-4 ${
              i < Math.round(product.rating)
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
        <span className="text-xs font-medium text-muted-foreground ml-2">
          {product.rating.toFixed(1)} ({product.numReviews || product.num_reviews || 0} reviews)
        </span>
      </div>
      
      {/* Stock quantity display with urgency */}
      <div className="mb-2">
        {product.stock > 0 ? (
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
              product.stock <= 5 
                ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' 
                : product.stock <= 10 
                  ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400'
                  : 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
            }`}>
              {product.stock <= 5 ? 'Only ' : ''}{product.stock} left
            </span>
            {product.stock <= 5 && (
              <span className="text-xs text-red-600 font-medium animate-pulse">
                Selling fast!
              </span>
            )}
          </div>
        ) : (
          <span className="text-xs font-medium text-red-600 bg-red-100 px-2 py-1 rounded-full dark:bg-red-900/20 dark:text-red-400">
            Out of stock
          </span>
        )}
      </div>
    </>
  );
};

export default ProductCardInfo;
