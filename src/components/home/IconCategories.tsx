import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Store, Flame, Apple, Carrot, Coffee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getCategories } from '@/services/product/categoryService';

const categoryIcons = [
  { name: 'halal', icon: Store, color: 'bg-yellow-100 text-yellow-600' },
  { name: 'deals', icon: Flame, color: 'bg-orange-100 text-orange-600' },
  { name: 'fruit', icon: Apple, color: 'bg-pink-100 text-pink-600' },
  { name: 'vegetable', icon: Carrot, color: 'bg-green-100 text-green-600' },
  { name: 'drink', icon: Coffee, color: 'bg-purple-100 text-purple-600' },
];

const getCategoryStyle = (categoryName: string) => {
  const name = categoryName.toLowerCase();
  for (const cat of categoryIcons) {
    if (name.includes(cat.name)) {
      return { icon: cat.icon, color: cat.color };
    }
  }
  return { icon: Store, color: 'bg-blue-100 text-blue-600' };
};

const IconCategories = () => {
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories
  });
  
  if (isLoading) {
    return (
      <section className="py-4">
        <div className="container mx-auto px-4">
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="flex-shrink-0 w-16 h-20 rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }
  
  if (categories.length === 0) {
    return null;
  }
  
  const displayCategories = categories.slice(0, 5);
  
  return (
    <section className="py-4">
      <div className="container mx-auto px-4">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {displayCategories.map((category) => {
            const { icon: IconComponent, color } = getCategoryStyle(category.name);
            return (
              <Link
                key={category.id}
                to={`/shop?category=${category.id}`}
                className="flex-shrink-0 flex flex-col items-center gap-1.5 min-w-[70px] group"
              >
                <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                  <IconComponent className="h-6 w-6" />
                </div>
                <span className="text-xs font-medium text-center line-clamp-2 px-1">
                  {category.name}
                </span>
              </Link>
            );
          })}
        </div>
        
        <div className="flex justify-center mt-4">
          <Link to="/shop">
            <Button variant="ghost" size="sm" className="text-sm text-primary gap-1.5">
              <Store className="h-4 w-4" />
              View More Categories
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default IconCategories;
