import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import ProductCard from '@/components/ProductCard';
import { getFeaturedProducts } from '@/services/product';
import { convertToProducts } from '@/utils/typeConverters';
import { toast } from '@/components/ui/use-toast';

const FeaturedProducts = () => {
  const { data: products = [], isLoading, error, refetch } = useQuery({
    queryKey: ['featuredProducts'],
    queryFn: getFeaturedProducts,
    onSettled: (data, error) => {
      if (error) {
        console.error('Failed to fetch featured products:', error);
        toast({
          title: 'Error loading products',
          description: 'Please try refreshing the page',
          variant: 'destructive'
        });
      } else {
        console.log('Featured products fetch completed', { count: data?.length });
      }
    }
  });
  
  if (isLoading) {
    return (
      <section className="py-12">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col space-y-3">
                <Skeleton className="h-[200px] w-full rounded-xl" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }
  
  if (error) {
    return (
      <section className="py-12">
        <div className="container">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Unable to load featured products</h2>
            <p className="text-muted-foreground mb-4">There was a problem loading the products</p>
            <Button onClick={() => refetch()}>Retry</Button>
          </div>
        </div>
      </section>
    );
  }
  
  // Convert product types if needed
  const convertedProducts = convertToProducts(products);
  
  if (convertedProducts.length === 0) {
    return null;
  }
  
  return (
    <section className="py-12">
      <div className="container">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Featured Products</h2>
          <Button variant="outline" asChild>
            <Link to="/shop" className="flex items-center gap-2">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {convertedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
