import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Star, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface Store {
  id: string;
  name: string;
  logo: string | null;
  description: string | null;
}

const defaultStoreLogos: Record<string, string> = {
  default: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=200&h=200&fit=crop",
};

const TopStores = () => {
  const { data: stores = [], isLoading } = useQuery({
    queryKey: ["top-stores"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stores")
        .select("id, name, logo, description")
        .eq("active", true)
        .limit(6);
      
      if (error) throw error;
      return data as Store[];
    },
  });

  // Generate a random rating for display (in production, this would come from actual reviews)
  const getStoreRating = (storeId: string) => {
    const hash = storeId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return (4 + (hash % 10) / 10).toFixed(1);
  };

  if (isLoading) {
    return (
      <section className="py-6 md:py-8">
        <div className="container mx-auto px-4">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (stores.length === 0) {
    return null;
  }

  return (
    <section className="py-6 md:py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-foreground">
              Shop by Store
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Browse products from your favorite stores
            </p>
          </div>
          <Link to="/shop">
            <Button variant="ghost" className="text-primary hover:text-primary/80">
              View All
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>

        {/* Stores Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {stores.map((store) => (
            <Link
              key={store.id}
              to={`/shop?store=${store.id}`}
              className="group bg-card border border-border rounded-2xl p-4 hover:shadow-lg hover:border-primary/30 transition-all duration-300"
            >
              {/* Store Logo */}
              <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-3 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                {store.logo ? (
                  <img
                    src={store.logo}
                    alt={store.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <span className="text-2xl md:text-3xl font-bold text-primary">
                    {store.name.charAt(0)}
                  </span>
                )}
              </div>

              {/* Store Info */}
              <div className="text-center">
                <h3 className="font-semibold text-sm md:text-base text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                  {store.name}
                </h3>
                
                {/* Rating */}
                <div className="flex items-center justify-center gap-1 mt-2">
                  <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs font-medium text-foreground">
                    {getStoreRating(store.id)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({Math.floor(Math.random() * 500) + 100})
                  </span>
                </div>

                {/* Description */}
                {store.description && (
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                    {store.description}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TopStores;
