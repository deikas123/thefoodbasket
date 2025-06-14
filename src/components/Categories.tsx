
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getCategories } from '@/services/product/categoryService';

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
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/categories/${category.slug || category.id}`}
              className="group relative overflow-hidden rounded-xl bg-gray-100 aspect-[4/3] transition-transform hover:scale-[1.02]"
            >
              {/* Category Image */}
              <img
                src={category.image || '/placeholder.svg'}
                alt={category.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.svg';
                }}
              />
              
              {/* Category Name Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
                <div className="text-white">
                  <h3 className="font-medium text-lg">{category.name}</h3>
                  {category.productCount !== undefined && (
                    <p className="text-sm opacity-90">{category.productCount} products</p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;
