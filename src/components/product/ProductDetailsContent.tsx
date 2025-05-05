
import ProductImageGallery from "@/components/product/ProductImageGallery";
import ProductInfo from "@/components/product/ProductInfo";
import ProductActions from "@/components/product/ProductActions";
import ProductShippingInfo from "@/components/product/ProductShippingInfo";

interface ProductDetailsContentProps {
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    stock: number;
    discountPercentage?: number;
    featured?: boolean;
  };
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
        discountPercentage={product.discountPercentage}
        featured={product.featured}
      />
      
      {/* Product info section */}
      <div className="space-y-6">
        <ProductInfo product={product} category={category} />
        <ProductActions product={product} />
        <ProductShippingInfo />
      </div>
    </div>
  );
};

export default ProductDetailsContent;
