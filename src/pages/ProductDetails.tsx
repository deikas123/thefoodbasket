
import { Suspense } from "react";
import ProductDetailsPage from "@/components/product/ProductDetailsPage";
import { Skeleton } from "@/components/ui/skeleton";

const ProductDetails = () => {
  return (
    <Suspense fallback={<Skeleton className="h-screen" />}>
      <ProductDetailsPage />
    </Suspense>
  );
};

export default ProductDetails;
