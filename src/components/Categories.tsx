
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowRight, Milk, Wheat, Apple, Carrot, Coffee, Cookie, Fish, Beef } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getCategories } from '@/services/product/categoryService';

// Category icon mapping
const getCategoryIcon = (categoryName: string) => {
  const name = categoryName.toLowerCase();
  if (name.includes('dairy') || name.includes('milk')) return Milk;
  if (name.includes('grain') || name.includes('bread') || name.includes('wheat')) return Wheat;
  if (name.includes('fruit') || name.includes('apple')) return Apple;
  if (name.includes('vegetable') || name.includes('carrot')) return Carrot;
  if (name.includes('beverage') || name.includes('drink') || name.includes('coffee')) return Coffee;
  if (name.includes('snack') || name.includes('cookie')) return Cookie;
  if (name.includes('seafood') || name.includes('fish')) return Fish;
  if (name.includes('meat') || name.includes('beef')) return Beef;
  return Apple; // Default icon
};

const Categories = () => {
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories
  });
  
  if (isLoading) {
    return (
      <section className="py-12">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Shop by Category</h2>
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-[180px] rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }
  
  if (categories.length === 0) {
    return null;
  }
  
  return (
    <section className="py-12">
      <div className="container">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Shop by Category</h2>
          <Button variant="outline" size="sm" asChild>
            <Link to="/shop" className="flex items-center gap-2">
              All Categories <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {categories.map((category) => {
            const IconComponent = getCategoryIcon(category.name);
            return (
              <Link
                key={category.id}
                to={`/shop?category=${category.id}`}
                className="group relative overflow-hidden rounded-xl bg-muted/30 hover:bg-muted/50 aspect-[4/3] transition-all duration-300 hover:scale-[1.02] hover:shadow-lg border border-border/50"
              >
                {/* Category Image Background */}
                <div className="absolute inset-0">
                  <img
                    src={category.image || '/placeholder.svg'}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 opacity-20"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                  />
                </div>
                
                {/* Category Content */}
                <div className="relative h-full flex flex-col items-center justify-center p-4 text-center">
                  {/* Category Icon */}
                  <div className="mb-3 p-3 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                    <IconComponent className="h-8 w-8" />
                  </div>
                  
                  {/* Category Name */}
                  <h3 className="font-semibold text-lg text-foreground mb-1 group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>
                  
                  {/* Product Count */}
                  {category.productCount !== undefined && (
                    <p className="text-sm text-muted-foreground">{category.productCount} products</p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Categories;
