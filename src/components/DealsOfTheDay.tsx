
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Product } from "@/types";
import { Clock, ArrowRight } from "lucide-react";
import ProductCard from "./ProductCard";
import { getAllProducts } from "@/services/productService";

interface TimeLeft {
  hours: string;
  minutes: string;
  seconds: string;
}

const DealsOfTheDay = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ hours: "00", minutes: "00", seconds: "00" });
  
  // Set end time to midnight
  const calculateEndTime = () => {
    const now = new Date();
    const endTime = new Date(now);
    endTime.setHours(23, 59, 59, 999);
    return endTime;
  };
  
  // Calculate time left until end of day
  const calculateTimeLeft = () => {
    const difference = calculateEndTime().getTime() - new Date().getTime();
    
    if (difference <= 0) {
      // It's a new day, reset the deals
      fetchDeals();
      return { hours: "00", minutes: "00", seconds: "00" };
    }
    
    const hours = Math.floor(difference / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);
    
    return {
      hours: hours.toString().padStart(2, "0"),
      minutes: minutes.toString().padStart(2, "0"),
      seconds: seconds.toString().padStart(2, "0"),
    };
  };
  
  // Fetch deals from the product service
  const fetchDeals = async () => {
    setIsLoading(true);
    try {
      const allProducts = await getAllProducts();
      // Filter products with discount percentage
      const discountedProducts = allProducts.filter(p => p.discountPercentage);
      setProducts(discountedProducts.slice(0, 4)); // Take up to 4 products
    } catch (error) {
      console.error("Error fetching deals:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchDeals();
  }, []);
  
  useEffect(() => {
    // Update countdown timer every second
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  if (!products.length && !isLoading) {
    return null;
  }
  
  return (
    <section className="py-12 px-4 bg-primary/5">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between mb-8">
          <div className="mb-4 md:mb-0">
            <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-2">
              Limited Time Offers
            </span>
            <h2 className="text-2xl md:text-3xl font-bold">Deals of the Day</h2>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center">
              <Clock className="mr-2 text-primary" />
              <div className="flex items-center">
                <div className="bg-primary/10 px-2 py-1 rounded text-primary font-mono">
                  {timeLeft.hours}
                </div>
                <span className="mx-1 text-primary font-medium">:</span>
                <div className="bg-primary/10 px-2 py-1 rounded text-primary font-mono">
                  {timeLeft.minutes}
                </div>
                <span className="mx-1 text-primary font-medium">:</span>
                <div className="bg-primary/10 px-2 py-1 rounded text-primary font-mono">
                  {timeLeft.seconds}
                </div>
              </div>
            </div>
            
            <Link to="/shop?deals=true">
              <Button variant="outline" size="sm" className="gap-2">
                View All
                <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {isLoading ? (
            // Loading skeletons
            Array(4).fill(0).map((_, index) => (
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

export default DealsOfTheDay;
