
import { useState, useEffect } from "react";
import { Product } from "@/types";
import ProductCard from "./ProductCard";

interface ProductsGridProps {
  products: Product[];
  title?: string;
  subtitle?: string;
  isLoading?: boolean;
  cols?: number;
}

const ProductsGrid = ({ 
  products, 
  title, 
  subtitle, 
  isLoading = false, 
  cols = 4 
}: ProductsGridProps) => {
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
        
        <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-${cols} gap-3 md:gap-4`}>
          {isLoading ? (
            // Loading skeletons
            Array(8).fill(0).map((_, index) => (
              <div key={index} className="product-card h-[250px]">
                <div className="aspect-square bg-gray-200 dark:bg-gray-800 animate-pulse rounded-md"></div>
                <div className="p-3">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2 animate-pulse"></div>
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 animate-pulse"></div>
                </div>
              </div>
            ))
          ) : (
            products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default ProductsGrid;
