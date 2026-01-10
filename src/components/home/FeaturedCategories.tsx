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
  'bg-green-500',
  'bg-yellow-500',
  'bg-orange-500',
  'bg-pink-500',
  'bg-blue-500',
  'bg-purple-500',
  'bg-red-500',
  'bg-teal-500',
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

        {/* Categories Scroll - Overlapping Style */}
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex -space-x-2 overflow-x-auto scrollbar-hide pb-2 pl-2"
        >
          {categories.map((category, index) => (
            <Link
              key={category.id}
              to={`/shop?category=${category.id}`}
              className="relative flex-shrink-0 group"
              style={{ zIndex: categories.length - index }}
            >
              {/* Category Image Circle */}
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-4 border-background shadow-lg hover:scale-105 transition-transform duration-300">
                <img
                  src={getCategoryImage(category.name, category.image)}
                  alt={category.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Category Label Badge */}
              <div 
                className={`absolute -bottom-1 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-white text-xs font-medium whitespace-nowrap shadow-md ${categoryColors[index % categoryColors.length]}`}
              >
                {category.name}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCategories;
