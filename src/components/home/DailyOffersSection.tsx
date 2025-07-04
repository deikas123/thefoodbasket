
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Star, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/utils/currencyFormatter";
import { ProductType } from "@/types/supabase";
import { Skeleton } from "@/components/ui/skeleton";

interface DailyOffer {
  id: string;
  product_id: string;
  discount_percentage: number;
  start_date: string;
  end_date: string;
  active: boolean;
  product?: ProductType;
}

const DailyOffersSection = () => {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  const { data: offers, isLoading, error } = useQuery({
    queryKey: ["daily-offers"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("daily_offers")
          .select(`
            *,
            products (*)
          `)
          .eq("active", true)
          .gte("end_date", new Date().toISOString())
          .lte("start_date", new Date().toISOString())
          .limit(4);

        if (error) {
          console.error("Error fetching daily offers:", error);
          return [];
        }

        if (!data) {
          return [];
        }

        // Map the data to include the product information
        return data.map((offer): DailyOffer => ({
          id: offer.id,
          product_id: offer.product_id || '',
          discount_percentage: offer.discount_percentage,
          start_date: offer.start_date,
          end_date: offer.end_date,
          active: offer.active,
          product: offer.products ? {
            id: offer.products.id,
            name: offer.products.name,
            description: offer.products.description,
            price: offer.products.price,
            image: offer.products.image,
            category_id: offer.products.category_id,
            stock: offer.products.stock,
            featured: offer.products.featured,
            rating: offer.products.rating,
            num_reviews: offer.products.num_reviews,
            discount_percentage: offer.discount_percentage, // Use the offer's discount
            created_at: offer.products.created_at,
            updated_at: offer.products.updated_at
          } as ProductType : undefined
        }));
      } catch (error) {
        console.error("Error in daily offers query:", error);
        return [];
      }
    },
  });

  // Calculate time remaining until end of day
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);
      
      const difference = endOfDay.getTime() - now.getTime();
      
      if (difference > 0) {
        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        
        setTimeLeft({ hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (error) {
    console.error("Daily offers error:", error);
    return null;
  }

  if (isLoading) {
    return (
      <section className="py-12 px-4 bg-gradient-to-r from-orange-50 to-red-50">
        <div className="container mx-auto">
          <div className="text-center mb-8">
            <Skeleton className="h-8 w-48 mx-auto mb-2" />
            <Skeleton className="h-4 w-32 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-80 w-full" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!offers || offers.length === 0) {
    return null;
  }

  return (
    <section className="py-12 px-4 bg-gradient-to-r from-orange-50 to-red-50">
      <div className="container mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Daily Offers</h2>
          <div className="flex items-center justify-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-orange-600" />
            <span>Ends in: {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {offers.map((offer) => {
            if (!offer.product) return null;
            
            const discountedPrice = offer.product.price * (1 - offer.discount_percentage / 100);
            
            return (
              <Card key={offer.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img
                    src={offer.product.image}
                    alt={offer.product.name}
                    className="w-full h-48 object-cover"
                  />
                  <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-600">
                    {offer.discount_percentage}% OFF
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-1">
                    {offer.product.name}
                  </h3>
                  
                  <div className="flex items-center mb-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.round(offer.product.rating)
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500 ml-1">
                      ({offer.product.num_reviews || 0})
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl font-bold text-primary">
                      {formatCurrency(discountedPrice)}
                    </span>
                    <span className="text-sm text-gray-500 line-through">
                      {formatCurrency(offer.product.price)}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Link to={`/product/${offer.product.id}`} className="flex-1">
                      <Button variant="outline" className="w-full text-xs">
                        View Details
                      </Button>
                    </Link>
                    <Button size="sm" className="px-3">
                      <ShoppingCart className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-8">
          <Link to="/shop?deals=true">
            <Button size="lg" className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
              View All Daily Offers
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default DailyOffersSection;
