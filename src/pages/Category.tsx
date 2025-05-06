
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getProductsByCategory, getCategories } from "@/services/product";
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
  
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });
  
  // Find current category from categories
  const currentCategory = categories?.find(cat => cat.id === slug);
  
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
        {categoriesLoading ? (
          <div className="mb-8">
            <Skeleton className="h-10 w-2/3 max-w-md mb-2" />
            <Skeleton className="h-4 w-1/2 max-w-sm" />
          </div>
        ) : currentCategory ? (
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">{currentCategory.name}</h1>
            {currentCategory.description && (
              <p className="text-gray-600">{currentCategory.description}</p>
            )}
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
