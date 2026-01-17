import { useState, useEffect, memo, useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductType } from '@/types/supabase';
import { getDailyOffersWithProducts } from '@/services/product/offerService';

interface TimeLeft {
  hours: string;
  minutes: string;
  seconds: string;
}

const DailyOffersSection = memo(() => {
  const [productsWithDiscount, setProductsWithDiscount] = useState<ProductType[]>([]);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ hours: "00", minutes: "00", seconds: "00" });
  const hasRefetchedRef = useRef(false);
  const currentDayRef = useRef(new Date().getDate());
  
  const { data: dailyOffers = [], isLoading, error, refetch } = useQuery({
    queryKey: ['daily-offers-active'],
    queryFn: getDailyOffersWithProducts,
    staleTime: 1000 * 60 * 15,
    gcTime: 1000 * 60 * 30,
    retry: 2,
  });
  
  useEffect(() => {
    if (dailyOffers.length > 0) {
      const mapped = dailyOffers
        .filter(offer => offer.product)
        .map(offer => {
          if (!offer.product) return null;
          return {
            ...offer.product,
            discountPercentage: offer.discount_percentage
          };
        })
        .filter(Boolean) as ProductType[];
      
      setProductsWithDiscount(mapped.slice(0, 4));
    } else {
      setProductsWithDiscount([]);
    }
  }, [dailyOffers]);
  
  // Stable time calculation function
  const calculateTimeLeft = useCallback((): TimeLeft => {
    const now = new Date();
    const endTime = new Date(now);
    endTime.setHours(23, 59, 59, 999);
    const difference = endTime.getTime() - now.getTime();
    
    if (difference <= 0) {
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
  }, []);
  
  // Timer effect - runs once on mount
  useEffect(() => {
    setTimeLeft(calculateTimeLeft());
    
    const timer = setInterval(() => {
      const updated = calculateTimeLeft();
      setTimeLeft(updated);
      
      // Check if day changed (new day started)
      const today = new Date().getDate();
      if (today !== currentDayRef.current && !hasRefetchedRef.current) {
        hasRefetchedRef.current = true;
        currentDayRef.current = today;
        refetch();
        // Reset the refetch flag after a delay
        setTimeout(() => {
          hasRefetchedRef.current = false;
        }, 5000);
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [calculateTimeLeft, refetch]);
  
  if (error) {
    return (
      <section className="py-6">
        <div className="container text-center">
          <h2 className="text-xl font-semibold mb-2">Unable to load daily offers</h2>
          <Button onClick={() => refetch()} size="sm">Retry</Button>
        </div>
      </section>
    );
  }
  
  if (isLoading) {
    return (
      <section className="py-12">
        <div className="container">
          <div className="flex justify-between items-center mb-8">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col space-y-3">
                <Skeleton className="h-[200px] w-full rounded-xl" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }
  
  if (productsWithDiscount.length === 0) {
    return null;
  }
  
  return (
    <section className="py-12 bg-gray-50 dark:bg-gray-800/30">
      <div className="container">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">Daily Special Offers</h2>
          <div className="flex items-center gap-3 md:gap-6">
            <div className="flex items-center">
              <div className="flex items-center gap-1">
                <div className="bg-primary/10 px-2 py-1 rounded text-primary font-mono text-sm md:text-base">
                  {timeLeft.hours}
                </div>
                <span className="text-primary font-medium">:</span>
                <div className="bg-primary/10 px-2 py-1 rounded text-primary font-mono text-sm md:text-base">
                  {timeLeft.minutes}
                </div>
                <span className="text-primary font-medium">:</span>
                <div className="bg-primary/10 px-2 py-1 rounded text-primary font-mono text-sm md:text-base">
                  {timeLeft.seconds}
                </div>
              </div>
            </div>
            
            <Link to="/shop?deals=true">
              <Button variant="outline" size="sm" className="gap-2 text-xs md:text-sm">
                View All <ArrowRight className="h-3 w-3 md:h-4 md:w-4" />
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
          {productsWithDiscount.map((product) => (
            <ProductCard 
              key={`offer-${product.id}`} 
              product={product}
              className="bg-white dark:bg-gray-800"
            />
          ))}
        </div>
      </div>
    </section>
  );
});

DailyOffersSection.displayName = "DailyOffersSection";
export default DailyOffersSection;
