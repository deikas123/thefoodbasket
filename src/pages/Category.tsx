
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getProductsByCategory, getCategoryById } from "@/services/product";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductsGrid from "@/components/ProductsGrid";
import { Skeleton } from "@/components/ui/skeleton";

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  
  const { data: products, isLoading: productsLoading, error, refetch } = useQuery({
    queryKey: ["category-products", slug],
    queryFn: () => getProductsByCategory(slug || ""),
    enabled: !!slug,
  });
  
  const { data: category, isLoading: categoryLoading } = useQuery({
    queryKey: ["category", slug],
    queryFn: () => getCategoryById(slug || ""),
    enabled: !!slug,
  });
  
  useEffect(() => {
    if (slug) {
      refetch();
    }
  }, [slug, refetch]);
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-12">
        {/* Category header */}
        {categoryLoading ? (
          <div className="mb-8">
            <Skeleton className="h-10 w-2/3 max-w-md mb-2" />
            <Skeleton className="h-4 w-1/2 max-w-sm" />
          </div>
        ) : category ? (
          <div className="mb-8 flex items-start gap-6">
            {category.image && (
              <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder.svg';
                  }}
                />
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold mb-2">{category.name}</h1>
              {category.description && (
                <p className="text-gray-600 mb-2">{category.description}</p>
              )}
              <p className="text-sm text-gray-500">
                {category.productCount || 0} products available
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Category not found</h1>
            <p className="text-gray-600">The category you are looking for does not exist.</p>
          </div>
        ) : (
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Products</h1>
          </div>
        )}
        
        {/* Products grid */}
        <ProductsGrid 
          products={products || []} 
          isLoading={productsLoading}
          error={error as Error | null}
          emptyMessage="No products found in this category"
        />
      </main>
      
      <Footer />
    </div>
  );
};

export default CategoryPage;
