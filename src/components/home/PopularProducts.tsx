import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import ProductCard from '@/components/ProductCard';
import { getProducts } from '@/services/productService';
import { getCategories } from '@/services/product/categoryService';

const PopularProducts = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => getProducts(),
    staleTime: 1000 * 60 * 5,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    staleTime: 1000 * 60 * 10,
  });

  const filteredProducts = useMemo(() => {
    const source = selectedCategory === 'all'
      ? products
      : products.filter(p => p.category === selectedCategory);
    return source.slice(0, 10);
  }, [products, selectedCategory]);

  const displayCategories = categories.slice(0, 5);

  if (productsLoading) {
    return (
      <section className="py-6 md:py-10">
        <div className="container mx-auto px-4">
          <Skeleton className="h-7 w-40 mb-4" />
          <div className="flex gap-2 mb-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-20 rounded-full" />
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="py-6 md:py-10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg md:text-xl font-bold text-foreground">Popular Products</h2>
          <Link to="/shop" className="text-sm text-primary font-medium hover:underline flex items-center gap-1">
            View All <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-3 mb-2">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            className="rounded-full text-xs whitespace-nowrap h-8"
            onClick={() => setSelectedCategory('all')}
          >
            All
          </Button>
          {displayCategories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              size="sm"
              className="rounded-full text-xs whitespace-nowrap h-8"
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.name.replace(/[^\w\s]/g, '').trim()}
            </Button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularProducts;
