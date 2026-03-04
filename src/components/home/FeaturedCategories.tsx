import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { getCategories } from '@/services/product/categoryService';
import { Apple, Carrot, Milk, Beef, Cookie, Coffee, ShoppingBasket, Wheat } from 'lucide-react';

const categoryIconMap: Record<string, { icon: any; bg: string; fg: string }> = {
  'fruit': { icon: Apple, bg: 'bg-green-100 dark:bg-green-900/30', fg: 'text-green-600 dark:text-green-400' },
  'vegetable': { icon: Carrot, bg: 'bg-orange-100 dark:bg-orange-900/30', fg: 'text-orange-600 dark:text-orange-400' },
  'dairy': { icon: Milk, bg: 'bg-blue-100 dark:bg-blue-900/30', fg: 'text-blue-600 dark:text-blue-400' },
  'meat': { icon: Beef, bg: 'bg-red-100 dark:bg-red-900/30', fg: 'text-red-600 dark:text-red-400' },
  'snack': { icon: Cookie, bg: 'bg-yellow-100 dark:bg-yellow-900/30', fg: 'text-yellow-600 dark:text-yellow-400' },
  'beverage': { icon: Coffee, bg: 'bg-purple-100 dark:bg-purple-900/30', fg: 'text-purple-600 dark:text-purple-400' },
  'bakery': { icon: Wheat, bg: 'bg-amber-100 dark:bg-amber-900/30', fg: 'text-amber-600 dark:text-amber-400' },
};

const getCategoryStyle = (name: string) => {
  const lower = name.toLowerCase();
  for (const [key, val] of Object.entries(categoryIconMap)) {
    if (lower.includes(key)) return val;
  }
  return { icon: ShoppingBasket, bg: 'bg-muted', fg: 'text-muted-foreground' };
};

const FeaturedCategories = () => {
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    staleTime: 1000 * 60 * 10,
  });

  if (isLoading) {
    return (
      <section className="py-4 md:py-6">
        <div className="container mx-auto px-4">
          <div className="flex gap-3 overflow-hidden">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="flex-shrink-0 w-20 h-24 rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) return null;

  return (
    <section className="py-4 md:py-6">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg md:text-xl font-bold text-foreground">Categories</h2>
          <Link to="/shop" className="text-sm text-primary font-medium hover:underline">
            See All
          </Link>
        </div>

        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
          {categories.map((category) => {
            const { icon: Icon, bg, fg } = getCategoryStyle(category.name);
            return (
              <Link
                key={category.id}
                to={`/shop?category=${category.id}`}
                className="flex-shrink-0 flex flex-col items-center gap-2 group"
              >
                <div className={`w-16 h-16 md:w-18 md:h-18 rounded-2xl ${bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shadow-sm`}>
                  <Icon className={`h-7 w-7 ${fg}`} />
                </div>
                <span className="text-[11px] md:text-xs font-medium text-center text-foreground line-clamp-1 max-w-[72px]">
                  {category.name.replace(/[^\w\s]/g, '').trim()}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCategories;
