
import { ProductType } from "@/types/supabase";

interface ProductDescriptionProps {
  product: ProductType;
}

const ProductDescription = ({ product }: ProductDescriptionProps) => {
  return (
    <div>
      <h3 className="text-lg font-medium">Description</h3>
      <p className="text-sm text-muted-foreground mt-1">
        {product.description}
      </p>
    </div>
  );
};

export default ProductDescription;
