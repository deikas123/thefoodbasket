
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
      // Map to ProductType format
      return products.map(product => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        image: product.image,
        category_id: product.category || '',
        stock: product.stock,
        featured: product.featured,
        rating: product.rating,
        num_reviews: product.numReviews || 0,
        discount_percentage: product.discountPercentage,
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
