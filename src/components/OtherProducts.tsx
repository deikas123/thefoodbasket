
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { ProductType } from "@/types/supabase";
import { getProducts } from "@/services/productService";
import ProductsGrid from "./ProductsGrid";

const OtherProducts = () => {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        // Get random products (in a real app, you might want to filter by criteria)
        const allProducts = await getProducts();
        
        // Filter out featured products for this section
        const nonFeaturedProducts = allProducts.filter(p => !p.featured);
        
        // Get a random selection of products
        const randomProducts = nonFeaturedProducts
          .sort(() => 0.5 - Math.random())
          .slice(0, 8);
        
        setProducts(randomProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProducts();
  }, []);
  
  // Always show the section, even with no products
  if (!products.length && !isLoading) {
    return (
      <div className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">More to Explore</h2>
            <Link to="/shop">
              <Button variant="outline" className="gap-2 button-animation">
                View All
                <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
          <div className="text-center py-8">
            <p className="text-muted-foreground">No products available at the moment.</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="py-8 md:py-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold">More to Explore</h2>
          <Link to="/shop">
            <Button variant="outline" className="gap-2 button-animation">
              View All
              <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
        
        <ProductsGrid 
          products={products} 
          isLoading={isLoading} 
          cols={4} 
        />
      </div>
    </div>
  );
};

export default OtherProducts;
