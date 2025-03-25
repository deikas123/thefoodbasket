
import { useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import { products } from "@/data/products";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const FeaturedProducts = () => {
  const [isLoading, setIsLoading] = useState(true);
  
  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Get featured products
  const featuredProducts = products.filter(product => product.featured);
  
  return (
    <section className="section-container">
      <div className="mb-12 text-center">
        <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-3">
          Featured Products
        </span>
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Best Sellers</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Discover our handpicked selection of premium products, known for their exceptional quality and taste.
        </p>
      </div>
      
      <div className="product-grid">
        {isLoading ? (
          // Loading skeletons
          Array(4).fill(0).map((_, index) => (
            <div key={index} className="product-card h-[400px]">
              <div className="product-image-container bg-gray-200 dark:bg-gray-800 animate-pulse"></div>
              <div className="p-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-3 animate-pulse"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3 animate-pulse"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-4 animate-pulse"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 animate-pulse"></div>
              </div>
            </div>
          ))
        ) : (
          featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        )}
      </div>
      
      <div className="text-center mt-12">
        <Link to="/shop">
          <Button 
            variant="outline" 
            size="lg" 
            className="gap-2 button-animation"
          >
            View All Products
            <ArrowRight size={16} />
          </Button>
        </Link>
      </div>
    </section>
  );
};

export default FeaturedProducts;
