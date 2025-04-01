
import { useState, useEffect } from "react";
import { Product } from "@/types";
import ProductsGrid from "./ProductsGrid";
import { getFrequentlyPurchasedTogether } from "@/services/productService";

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
        // Use the service to get frequently purchased together products
        const similarProducts = await getFrequentlyPurchasedTogether(currentProductId);
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
