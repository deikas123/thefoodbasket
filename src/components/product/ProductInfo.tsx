
import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Star } from "lucide-react";
import { formatCurrency } from "@/utils/currencyFormatter";
import { ProductType } from "@/types/supabase";

interface ProductInfoProps {
  product: ProductType;
  category?: {
    id: string;
    name: string;
  } | null;
}

const ProductInfo = ({ product, category }: ProductInfoProps) => {
  // Format the rating consistently with other components
  const formattedRating = product.rating ? Number(product.rating).toFixed(1) : '0.0';
  
  // Calculate the discounted price if there is a discount
  const discountedPrice = product.discountPercentage
    ? product.price * (1 - product.discountPercentage / 100)
    : null;

  return (
    <div className="space-y-4">
      {/* Product Name */}
      <h1 className="text-2xl md:text-3xl font-bold">{product.name}</h1>
      
      {/* Product Rating */}
      <div className="flex items-center space-x-2">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-5 w-5 ${
                star <= Math.round(product.rating)
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          ))}
        </div>
        <span className="font-medium">{formattedRating}/5</span>
        <span className="text-muted-foreground">
          ({product.numReviews} {product.numReviews === 1 ? 'review' : 'reviews'})
        </span>
      </div>
      
      {/* Product Price */}
      <div className="flex items-center space-x-3 mt-2">
        {discountedPrice ? (
          <>
            <span className="text-2xl font-bold">
              {formatCurrency(discountedPrice)}
            </span>
            <span className="text-lg text-muted-foreground line-through">
              {formatCurrency(product.price)}
            </span>
            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded">
              {product.discountPercentage}% OFF
            </span>
          </>
        ) : (
          <span className="text-2xl font-bold">
            {formatCurrency(product.price)}
          </span>
        )}
      </div>
      
      {/* Stock Status */}
      <div className="mt-2">
        {product.stock > 0 ? (
          <span className="text-green-600 font-medium">In Stock ({product.stock} available)</span>
        ) : (
          <span className="text-red-600 font-medium">Out of Stock</span>
        )}
      </div>
      
      <Separator />
      
      {/* Product Description */}
      <div>
        <h2 className="text-lg font-semibold mb-2">Description</h2>
        <p className="text-muted-foreground whitespace-pre-line">
          {product.description}
        </p>
      </div>
      
      <Separator />
      
      {/* Additional Info */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Category</h3>
          <p>{category?.name || 'Uncategorized'}</p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Product ID</h3>
          <p>{product.id.substring(0, 8)}</p>
        </div>
      </div>
    </div>
  );
};

export default ProductInfo;
