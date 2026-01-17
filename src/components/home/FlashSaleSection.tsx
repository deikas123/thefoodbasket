import { useState, useEffect, memo, useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductType } from '@/types/supabase';
import { getActiveFlashSales, FlashSaleWithProducts } from '@/services/flashSaleService';

interface TimeLeft {
  hours: string;
  minutes: string;
  seconds: string;
}

const FlashSaleSection = memo(() => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ hours: "00", minutes: "00", seconds: "00" });
  const [currentSale, setCurrentSale] = useState<FlashSaleWithProducts | null>(null);
  const [productsWithDiscount, setProductsWithDiscount] = useState<ProductType[]>([]);
  const hasRefetchedRef = useRef(false);
  
  const { data: flashSales = [], isLoading, error, refetch } = useQuery({
    queryKey: ['flash-sales-active'],
    queryFn: getActiveFlashSales,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
    retry: 2,
  });
  
  // Select the first active flash sale
  useEffect(() => {
    if (flashSales.length > 0) {
      const sale = flashSales[0];
      setCurrentSale(sale);
      hasRefetchedRef.current = false; // Reset refetch flag for new sale
      
      // Map products with discount applied
      const mapped = sale.products
        .filter(p => p.product)
        .map(saleProduct => {
          if (!saleProduct.product) return null;
          
          // Calculate final price
          const originalPrice = saleProduct.product.price;
          const discountedPrice = saleProduct.sale_price || 
            originalPrice * (1 - sale.discount_percentage / 100);
          
          return {
            ...saleProduct.product,
            discount_percentage: sale.discount_percentage,
            originalPrice,
            flashSalePrice: discountedPrice,
          } as ProductType;
        })
        .filter(Boolean) as ProductType[];
      
      setProductsWithDiscount(mapped.slice(0, 6));
    } else {
      setCurrentSale(null);
      setProductsWithDiscount([]);
    }
  }, [flashSales]);
  
  // Calculate time left - stable function
  const calculateTimeLeft = useCallback((endDate: string): TimeLeft => {
    const endTime = new Date(endDate).getTime();
    const now = Date.now();
    const difference = endTime - now;
    
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
  
  // Timer effect - only depends on end_date string
  useEffect(() => {
    if (!currentSale?.end_date) return;
    
    const endDate = currentSale.end_date;
    
    // Set initial time
    setTimeLeft(calculateTimeLeft(endDate));
    
    const timer = setInterval(() => {
      const updated = calculateTimeLeft(endDate);
      setTimeLeft(updated);
      
      // Refetch only once when sale ends
      if (updated.hours === "00" && updated.minutes === "00" && updated.seconds === "00") {
        if (!hasRefetchedRef.current) {
          hasRefetchedRef.current = true;
          clearInterval(timer);
          refetch();
        }
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [currentSale?.end_date, calculateTimeLeft, refetch]);
  
  if (error) {
    return null;
  }
  
  if (isLoading) {
    return (
      <section className="py-12">
        <div className="container">
          <div className="flex justify-between items-center mb-8">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-col space-y-3">
                <Skeleton className="h-[150px] w-full rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }
  
  if (!currentSale || productsWithDiscount.length === 0) {
    return null;
  }
  
  const bannerColor = currentSale.banner_color || '#ef4444';
  
  return (
    <section 
      className="py-8 md:py-12 relative overflow-hidden"
      style={{ 
        background: `linear-gradient(135deg, ${bannerColor}15 0%, ${bannerColor}05 100%)` 
      }}
    >
      {/* Decorative elements */}
      <div 
        className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-20"
        style={{ backgroundColor: bannerColor }}
      />
      <div 
        className="absolute bottom-0 left-0 w-48 h-48 rounded-full blur-3xl opacity-10"
        style={{ backgroundColor: bannerColor }}
      />
      
      <div className="container relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div 
              className="p-2 rounded-lg"
              style={{ backgroundColor: `${bannerColor}20` }}
            >
              <Zap className="h-6 w-6" style={{ color: bannerColor }} />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">{currentSale.name}</h2>
              {currentSale.description && (
                <p className="text-muted-foreground text-sm">{currentSale.description}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-4 md:gap-6">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">Ends in:</span>
              <div className="flex items-center gap-1">
                <div 
                  className="px-2 py-1 rounded text-white font-mono text-sm md:text-base font-bold"
                  style={{ backgroundColor: bannerColor }}
                >
                  {timeLeft.hours}
                </div>
                <span className="font-bold" style={{ color: bannerColor }}>:</span>
                <div 
                  className="px-2 py-1 rounded text-white font-mono text-sm md:text-base font-bold"
                  style={{ backgroundColor: bannerColor }}
                >
                  {timeLeft.minutes}
                </div>
                <span className="font-bold" style={{ color: bannerColor }}>:</span>
                <div 
                  className="px-2 py-1 rounded text-white font-mono text-sm md:text-base font-bold"
                  style={{ backgroundColor: bannerColor }}
                >
                  {timeLeft.seconds}
                </div>
              </div>
            </div>
            
            <Link to="/shop?flash-sale=true">
              <Button variant="outline" size="sm" className="gap-2 text-xs md:text-sm">
                View All <ArrowRight className="h-3 w-3 md:h-4 md:w-4" />
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          {productsWithDiscount.map((product) => (
            <ProductCard 
              key={`flash-${product.id}`} 
              product={product}
              className="bg-white dark:bg-gray-800"
            />
          ))}
        </div>
      </div>
    </section>
  );
});

FlashSaleSection.displayName = "FlashSaleSection";
export default FlashSaleSection;
