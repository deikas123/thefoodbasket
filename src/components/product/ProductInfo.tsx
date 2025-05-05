
import { Link } from "react-router-dom";
import { AlertCircle, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  const salePrice = product.discountPercentage
    ? (product.price * (1 - product.discountPercentage / 100)).toFixed(2)
    : null;

  return (
    <div className="space-y-6">
      {category && (
        <Link to={`/shop?category=${category.id}`}>
          <Badge variant="outline" className="mb-2">
            {category.name}
          </Badge>
        </Link>
      )}
      
      <h1 className="text-3xl font-bold">{product.name}</h1>
      
      <div className="mt-2 flex items-baseline gap-2">
        {salePrice ? (
          <>
            <span className="text-2xl font-bold">{formatCurrency(parseFloat(salePrice))}</span>
            <span className="text-lg text-muted-foreground line-through">
              {formatCurrency(product.price)}
            </span>
          </>
        ) : (
          <span className="text-2xl font-bold">{formatCurrency(product.price)}</span>
        )}
      </div>
      
      <p className="text-muted-foreground leading-relaxed">
        {product.description}
      </p>
      
      <div className="flex items-center gap-2">
        {product.stock > 0 ? (
          <>
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span>
              {product.stock > 10 
                ? 'In Stock' 
                : `Only ${product.stock} left in stock`
              }
            </span>
          </>
        ) : (
          <>
            <AlertCircle className="h-5 w-5 text-destructive" />
            <span className="text-destructive">Out of Stock</span>
          </>
        )}
      </div>
      
      <Separator />
    </div>
  );
};

export default ProductInfo;
