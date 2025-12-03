import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getCategories } from '@/services/product/categoryService';
import { useRef, useState } from 'react';

const categoryImages: Record<string, string> = {
  'fruits': 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=150&h=150&fit=crop',
  'vegetables': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=150&h=150&fit=crop',
  'dairy': 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=150&h=150&fit=crop',
  'bakery': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=150&h=150&fit=crop',
  'meat': 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=150&h=150&fit=crop',
  'snacks': 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=150&h=150&fit=crop',
  'beverages': 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=150&h=150&fit=crop',
  'default': 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=150&h=150&fit=crop',
};

const getCategoryImage = (name: string, image?: string | null) => {
  if (image) return image;
  const lowercaseName = name.toLowerCase();
  for (const [key, url] of Object.entries(categoryImages)) {
    if (lowercaseName.includes(key)) return url;
  }
  return categoryImages.default;
};

const categoryColors = [
  'bg-yellow-50 border-yellow-200 dark:bg-yellow-950/30 dark:border-yellow-800/50',
  'bg-pink-50 border-pink-200 dark:bg-pink-950/30 dark:border-pink-800/50',
  'bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800/50',
  'bg-orange-50 border-orange-200 dark:bg-orange-950/30 dark:border-orange-800/50',
  'bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800/50',
  'bg-purple-50 border-purple-200 dark:bg-purple-950/30 dark:border-purple-800/50',
  'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800/50',
  'bg-teal-50 border-teal-200 dark:bg-teal-950/30 dark:border-teal-800/50',
];

const FeaturedCategories = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories
  });

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
      setTimeout(checkScroll, 300);
    }
  };

  if (isLoading) {
    return (
      <section className="py-6 md:py-8">
        <div className="container mx-auto px-4">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="flex-shrink-0 w-28 h-36 rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) return null;

  return (
    <section className="py-6 md:py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <h2 className="text-xl md:text-2xl font-bold text-foreground">Featured Categories</h2>
            <div className="hidden md:flex items-center gap-3 text-sm">
              {categories.slice(0, 4).map((cat) => (
                <Link 
                  key={cat.id} 
                  to={`/shop?category=${cat.id}`}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Categories Scroll */}
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
        >
          {categories.map((category, index) => (
            <Link
              key={category.id}
              to={`/shop?category=${category.id}`}
              className={`flex-shrink-0 flex flex-col items-center p-4 rounded-2xl border-2 transition-all hover:shadow-lg hover:-translate-y-1 group ${categoryColors[index % categoryColors.length]}`}
              style={{ minWidth: '120px' }}
            >
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden mb-3 bg-background/50">
                <img
                  src={getCategoryImage(category.name, category.image)}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <span className="text-sm font-medium text-foreground text-center line-clamp-1">
                {category.name}
              </span>
              <span className="text-xs text-muted-foreground mt-1">
                {Math.floor(Math.random() * 15) + 5} items
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCategories;
