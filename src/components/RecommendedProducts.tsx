
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCard } from "@/components";
import { getFrequentlyPurchasedTogether } from "@/services/productService";

interface RecommendedProductsProps {
  currentProductId: string;
  currentProductCategory?: string;
}

const RecommendedProducts = ({ currentProductId }: RecommendedProductsProps) => {
  const { data: recommendedProducts, isLoading } = useQuery({
    queryKey: ["recommended-products", currentProductId],
    queryFn: () => getFrequentlyPurchasedTogether(currentProductId),
    enabled: !!currentProductId,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Frequently Bought Together</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-60 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!recommendedProducts || recommendedProducts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Frequently Bought Together</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {recommendedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default RecommendedProducts;
