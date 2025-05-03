
import { memo } from "react";
import { Product } from "@/types";
import ProductCard from "./ProductCard";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductsGridProps {
  products: Product[];
  title?: string;
  subtitle?: string;
  isLoading?: boolean;
  cols?: number;
}

// Using memo to prevent unnecessary re-renders
const ProductsGrid = memo(({ 
  products, 
  title, 
  subtitle, 
  isLoading = false, 
  cols = 4 
}: ProductsGridProps) => {
  // Create a column class based on the cols prop
  const getColsClass = () => {
    switch(cols) {
      case 2: return "grid-cols-1 sm:grid-cols-2";
      case 3: return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
      case 4: return "grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
      case 5: return "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5";
      case 6: return "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6";
      default: return "grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
    }
  };

  return (
    <section className="py-10 px-4">
      <div className="container mx-auto">
        {(title || subtitle) && (
          <div className="mb-8 text-center">
            {title && (
              <h2 className="text-2xl md:text-3xl font-bold mb-3">{title}</h2>
            )}
            {subtitle && (
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {subtitle}
              </p>
            )}
          </div>
        )}
        
        <div className={`grid ${getColsClass()} gap-3 md:gap-4`}>
          {isLoading ? (
            // Loading skeletons
            Array(8).fill(0).map((_, index) => (
              <div key={index} className="product-card">
                <div className="aspect-square bg-gray-200 dark:bg-gray-800 animate-pulse rounded-md"></div>
                <div className="p-3 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-6 w-1/3 mt-2" />
                  <Skeleton className="h-8 w-full mt-4" />
                </div>
              </div>
            ))
          ) : products.length > 0 ? (
            products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-muted-foreground">No products found</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
});

ProductsGrid.displayName = "ProductsGrid";
export default ProductsGrid;
