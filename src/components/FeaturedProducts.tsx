
import { useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import { products as mockProducts } from "@/data/products";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { convertToProducts } from "@/utils/typeConverters";
import { ProductType } from "@/types/supabase";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "@/components/ui/carousel";

const FeaturedProducts = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  // Handle resize events
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Get featured products and convert to Product type
  const featuredProductTypes = mockProducts
    .filter(product => product.featured)
    .map(product => ({
      ...product,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      num_reviews: product.numReviews,
      numReviews: product.numReviews
    })) as ProductType[];
    
  const featuredProducts = convertToProducts(featuredProductTypes);
  
  return (
    <section className="py-12 px-4 md:py-16">
      <div className="container mx-auto">
        <div className="mb-8 md:mb-12 text-center">
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-3">
            Featured Products
          </span>
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Our Best Sellers</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover our handpicked selection of premium products, known for their exceptional quality and taste.
          </p>
        </div>
        
        {isMobile ? (
          // Mobile view - Carousel
          <div className="px-1">
            <Carousel className="w-full">
              <CarouselContent>
                {isLoading ? (
                  // Loading skeletons for carousel
                  Array(4).fill(0).map((_, index) => (
                    <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3 pl-2 pr-2">
                      <div className="product-card h-[300px]">
                        <div className="aspect-square bg-gray-200 dark:bg-gray-800 animate-pulse rounded-md"></div>
                        <div className="p-3">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2 animate-pulse"></div>
                          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2 animate-pulse"></div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2 animate-pulse"></div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 animate-pulse"></div>
                        </div>
                      </div>
                    </CarouselItem>
                  ))
                ) : (
                  featuredProducts.map((product) => (
                    <CarouselItem key={product.id} className="basis-full pl-2 pr-2">
                      <ProductCard product={product} />
                    </CarouselItem>
                  ))
                )}
              </CarouselContent>
              <div className="flex justify-center mt-4">
                <CarouselPrevious className="relative mr-2 transform-none translate-y-0" />
                <CarouselNext className="relative ml-2 transform-none translate-y-0" />
              </div>
            </Carousel>
          </div>
        ) : (
          // Desktop view - Grid
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {isLoading ? (
              // Loading skeletons for grid
              Array(8).fill(0).map((_, index) => (
                <div key={index} className="product-card h-[300px]">
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
              featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
          </div>
        )}
        
        <div className="text-center mt-8">
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
      </div>
    </section>
  );
};

export default FeaturedProducts;
