
import { useState, useEffect, memo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { convertToProduct } from '@/utils/typeConverters';
import { getDailyOffersWithProducts } from '@/services/product/offerService';
import { Product } from '@/types';
import { toast } from '@/components/ui/use-toast';

const DailyOffersSection = memo(() => {
  const [productsWithDiscount, setProductsWithDiscount] = useState<Product[]>([]);
  
  // Fetch daily offers from Supabase with optimized settings
  const { data: dailyOffers = [], isLoading, error, refetch } = useQuery({
    queryKey: ['daily-offers-active'],
    queryFn: getDailyOffersWithProducts,
    staleTime: 1000 * 60 * 15, // 15 minutes
    gcTime: 1000 * 60 * 30,    // 30 minutes
    retry: 2,
    onError: (err) => {
      console.error('Failed to fetch daily offers:', err);
    }
  });
  
  useEffect(() => {
    // Convert the offers to product type with the discount applied
    if (dailyOffers.length > 0) {
      const mapped = dailyOffers
        .filter(offer => offer.product) // filter out offers without products
        .map(offer => {
          if (!offer.product) return null;
          
          // Convert to our Product type
          const baseProduct = {
            id: offer.product.id,
            name: offer.product.name,
            description: offer.product.description || '',
            price: offer.product.price,
            image: offer.product.image,
            category: '',
            stock: offer.product.stock || 0,
            featured: false,
            rating: 0,
            numReviews: 0,
            discountPercentage: offer.discount_percentage
          };
          
          return baseProduct;
        })
        .filter(Boolean) as Product[];
      
      setProductsWithDiscount(mapped);
    } else {
      setProductsWithDiscount([]);
    }
  }, [dailyOffers]);
  
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
    return null; // Don't show the section if there are no offers
  }
  
  return (
    <section className="py-12 bg-gray-50 dark:bg-gray-800/30">
      <div className="container">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">Daily Special Offers</h2>
          <Button variant="outline" className="gap-2">
            View All <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
