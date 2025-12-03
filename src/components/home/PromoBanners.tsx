import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const banners = [
  {
    id: 1,
    title: 'Everyday Fresh & Clean with Our Products',
    image: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=400&h=300&fit=crop',
    bgColor: 'bg-green-100 dark:bg-green-950/40',
    link: '/shop'
  },
  {
    id: 2,
    title: 'Make your Breakfast Healthy and Easy',
    image: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=400&h=300&fit=crop',
    bgColor: 'bg-pink-100 dark:bg-pink-950/40',
    link: '/shop'
  },
  {
    id: 3,
    title: 'The best Organic Products Online',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop',
    bgColor: 'bg-yellow-100 dark:bg-yellow-950/40',
    link: '/shop'
  }
];

const PromoBanners = () => {
  return (
    <section className="py-6 md:py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {banners.map((banner) => (
            <Link
              key={banner.id}
              to={banner.link}
              className={`group relative rounded-2xl overflow-hidden ${banner.bgColor} p-5 md:p-6 min-h-[200px] flex flex-col justify-between transition-shadow hover:shadow-lg`}
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
