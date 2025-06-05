
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getProductById } from "@/services/productService";
import { getCategoryById } from "@/services/categoryService";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductDetailsBreadcrumb from "@/components/product/ProductDetailsBreadcrumb";
import ProductDetailsContent from "@/components/product/ProductDetailsContent";
import ProductDetailsLoading from "@/components/product/ProductDetailsLoading";
import ProductDetailsError from "@/components/product/ProductDetailsError";
import ProductReviews from "@/components/product/ProductReviews";
import FrequentlyPurchasedTogether from "@/components/product/FrequentlyPurchasedTogether";
import { Separator } from "@/components/ui/separator";

const ProductDetailsPage = () => {
  const { id: productId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const productQuery = useQuery({
    queryKey: ["product", productId],
    queryFn: () => getProductById(productId || ""),
    enabled: !!productId
  });
  
  const categoryQuery = useQuery({
    queryKey: ["category", productQuery.data?.category],
    queryFn: () => getCategoryById(productQuery.data?.category || ""),
    enabled: !!productQuery.data?.category
  });
  
  const product = productQuery.data;
  const category = categoryQuery.data;
  
  const goBack = () => {
    navigate(-1);
  };
  
  if (productQuery.isLoading) {
    return <ProductDetailsLoading onGoBack={goBack} />;
  }
  
  if (productQuery.isError || !product) {
    return <ProductDetailsError />;
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow pt-32 pb-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <ProductDetailsBreadcrumb 
            goBack={goBack} 
            category={category} 
            productName={product.name} 
          />
          
          <ProductDetailsContent 
            product={product}
            category={category}
          />
          
          {/* Product reviews section */}
          {product && (
            <div className="mt-16">
              <Separator className="mb-8" />
              <ProductReviews productId={product.id} />
            </div>
          )}
          
          {/* Frequently purchased together section */}
          {product && (
            <div className="mt-16">
              <Separator className="mb-8" />
              <FrequentlyPurchasedTogether productId={product.id} />
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetailsPage;
