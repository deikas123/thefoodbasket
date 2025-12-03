import { useState } from 'react';
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
    queryFn: () => getProducts()
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories
  });

  // Find selected category name for filtering
  const selectedCategoryName = selectedCategory === 'all' 
    ? null 
    : categories.find(c => c.id === selectedCategory)?.name;

  const filteredProducts = selectedCategory === 'all'
    ? products.slice(0, 10)
    : products.filter(p => p.category === selectedCategoryName).slice(0, 10);

  const displayCategories = categories.slice(0, 5);

  if (productsLoading) {
    return (
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-8 w-48" />
            <div className="flex gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-20 rounded-full" />
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-72 rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="py-8 md:py-12">
      <div className="container mx-auto px-4">
        {/* Header with category tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-foreground">Popular Products</h2>
          
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'ghost'}
              size="sm"
              className="rounded-full text-xs whitespace-nowrap"
              onClick={() => setSelectedCategory('all')}
            >
              All
            </Button>
            {displayCategories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'ghost'}
                size="sm"
                className="rounded-full text-xs whitespace-nowrap"
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* View All Button */}
        {filteredProducts.length >= 10 && (
          <div className="flex justify-center mt-8">
            <Button variant="outline" asChild className="rounded-full gap-2">
              <Link to="/shop">
                View All Products
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default PopularProducts;
