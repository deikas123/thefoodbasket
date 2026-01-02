import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

const bgColors = [
  'bg-green-100 dark:bg-green-950/40',
  'bg-pink-100 dark:bg-pink-950/40',
  'bg-yellow-100 dark:bg-yellow-950/40',
  'bg-blue-100 dark:bg-blue-950/40',
  'bg-purple-100 dark:bg-purple-950/40',
];

const PromoBanners = () => {
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
        .order('priority', { ascending: true })
        .limit(3);
      
      if (error) throw error;
      return data;
    },
  });

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

  return (
    <section className="py-6 md:py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {banners.map((banner, index) => (
            <Link
              key={banner.id}
              to={banner.link || '/shop'}
              className={`group relative rounded-2xl overflow-hidden ${bgColors[index % bgColors.length]} p-5 md:p-6 min-h-[200px] flex flex-col justify-between transition-shadow hover:shadow-lg`}
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
          ))}
        </div>
      </div>
    </section>
  );
};

export default PromoBanners;
