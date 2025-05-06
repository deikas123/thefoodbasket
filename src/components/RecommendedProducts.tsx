
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import ProductCard from "@/components/ProductCard"; 
import { getFrequentlyPurchasedTogether } from "@/services/productService";
import { ProductType } from "@/types/supabase";

interface RecommendedProductsProps {
  currentProductId: string;
  currentProductCategory?: string;
}

const RecommendedProducts = ({ currentProductId }: RecommendedProductsProps) => {
  const { data: recommendedProducts, isLoading } = useQuery({
    queryKey: ["recommended-products", currentProductId],
    queryFn: async () => {
      const products = await getFrequentlyPurchasedTogether(currentProductId);
      // Add the missing required fields for ProductType
      return products.map(product => ({
        ...product,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as ProductType));
    },
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
