
import ProductImageGallery from "@/components/product/ProductImageGallery";
import ProductInfo from "@/components/product/ProductInfo";
import ProductShippingInfo from "@/components/product/ProductShippingInfo";
import { ProductType } from "@/types/supabase";

interface ProductDetailsContentProps {
  product: ProductType;
  category?: {
    id: string;
    name: string;
  } | null;
}

const ProductDetailsContent = ({ product, category }: ProductDetailsContentProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
      {/* Product image section */}
      <ProductImageGallery
        image={product.image}
        name={product.name}
        discountPercentage={product.discount_percentage}
        featured={product.featured}
      />
      
      {/* Product info section */}
      <div className="space-y-6">
        <ProductInfo product={product} />
        <ProductShippingInfo />
      </div>
    </div>
  );
};

export default ProductDetailsContent;
