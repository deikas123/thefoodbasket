
import { useState, useEffect } from "react";
import { Product } from "@/types";
import ProductsGrid from "./ProductsGrid";
import { getProducts } from "@/services/productService";

interface RecommendedProductsProps {
  currentProductId: string;
  currentProductCategory: string;
}

const RecommendedProducts = ({ currentProductId, currentProductCategory }: RecommendedProductsProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendedProducts = async () => {
      setIsLoading(true);
      try {
        // In a real app with purchase history data, we would fetch frequently purchased together products
        // For now, we'll simulate by getting products from the same category
        const allProducts = await getProducts();
        
        // Filter products with the same category but exclude current product
        const similarProducts = allProducts
          .filter(p => p.category === currentProductCategory && p.id !== currentProductId)
          // Take max 4 products
          .slice(0, 4);
        
        setProducts(similarProducts);
      } catch (error) {
        console.error("Error fetching recommended products:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRecommendedProducts();
  }, [currentProductId, currentProductCategory]);

  if (!products.length && !isLoading) {
    return null;
  }
  
  return (
    <div className="py-6 md:py-10">
      <h2 className="text-xl md:text-2xl font-bold mb-4">Frequently Purchased Together</h2>
      <ProductsGrid 
        products={products} 
        isLoading={isLoading} 
        cols={4} 
      />
    </div>
  );
};

export default RecommendedProducts;
