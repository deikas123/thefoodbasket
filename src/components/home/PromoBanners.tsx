import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { useCallback, useEffect, useState } from 'react';

const bgColors = [
  'bg-green-100 dark:bg-green-950/40',
  'bg-pink-100 dark:bg-pink-950/40',
  'bg-yellow-100 dark:bg-yellow-950/40',
  'bg-blue-100 dark:bg-blue-950/40',
  'bg-purple-100 dark:bg-purple-950/40',
  'bg-orange-100 dark:bg-orange-950/40',
];

const PromoBanners = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { 
      loop: true, 
      align: 'start', 
      slidesToScroll: 1,
      dragFree: false,
      containScroll: 'trimSnaps',
    },
    [Autoplay({ delay: 4000, stopOnInteraction: true, stopOnMouseEnter: true })]
  );
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const { data: banners, isLoading } = useQuery({
    queryKey: ['promo-banners'],
    queryFn: async () => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .eq('active', true)
        .lte('start_date', now)
        .gte('end_date', now)
        .order('priority', { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on('select', onSelect);
    onSelect();
  }, [emblaApi, onSelect]);

  if (isLoading) {
    return (
      <section className="py-6 md:py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-[200px] rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!banners || banners.length === 0) {
    return null;
  }

  // For 3 or fewer banners, show grid layout
  if (banners.length <= 3) {
    return (
      <section className="py-6 md:py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {banners.map((banner, index) => (
              <BannerCard key={banner.id} banner={banner} colorIndex={index} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // For more than 3 banners, show carousel
  return (
    <section className="py-6 md:py-8">
      <div className="container mx-auto px-4">
        <div className="relative">
          {/* Carousel */}
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-4 md:gap-6">
              {banners.map((banner, index) => (
                <div 
                  key={banner.id} 
                  className="flex-shrink-0 w-full md:w-[calc(33.333%-1rem)]"
                >
                  <BannerCard banner={banner} colorIndex={index} />
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          <Button
            variant="outline"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm hidden md:flex"
            onClick={scrollPrev}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm hidden md:flex"
            onClick={scrollNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-4">
            {scrollSnaps.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollTo(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === selectedIndex ? 'bg-primary' : 'bg-muted-foreground/30'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

interface BannerCardProps {
  banner: {
    id: string;
    title: string;
    subtitle?: string | null;
    image: string;
    link?: string | null;
  };
  colorIndex: number;
}

const BannerCard = ({ banner, colorIndex }: BannerCardProps) => (
  <Link
    to={banner.link || '/shop'}
    className={`group relative rounded-2xl overflow-hidden ${bgColors[colorIndex % bgColors.length]} p-5 md:p-6 min-h-[200px] flex flex-col justify-between transition-shadow hover:shadow-lg block`}
  >
    {/* Background Image */}
    <div className="absolute right-0 bottom-0 w-2/3 h-full">
      <img
        src={banner.image}
        alt={banner.title}
        className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-transparent" />
    </div>
    
    {/* Content */}
    <div className="relative z-10 max-w-[60%]">
      <h3 className="text-base md:text-lg font-bold text-foreground leading-tight mb-4">
        {banner.title}
      </h3>
      {banner.subtitle && (
        <p className="text-sm text-muted-foreground">{banner.subtitle}</p>
      )}
    </div>
    
    <Button
      variant="default"
      size="sm"
      className="relative z-10 w-fit rounded-md bg-primary hover:bg-primary/90 text-primary-foreground gap-1 text-xs"
    >
      Shop Now
      <ArrowRight className="h-3 w-3" />
    </Button>
  </Link>
);

export default PromoBanners;
