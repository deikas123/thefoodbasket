import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight } from "lucide-react";

const TopGroceryStores = () => {
  const { data: stores, isLoading } = useQuery({
    queryKey: ["top-stores"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stores")
        .select("*")
        .eq("active", true)
        .order("created_at", { ascending: false })
        .limit(6);
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <section className="py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-5 w-16" />
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!stores || stores.length === 0) return null;

  return (
    <section className="py-6">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Top Grocery Stores</h2>
          <Link to="/admin/stores" className="text-sm text-primary hover:underline flex items-center gap-1">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {stores.map((store) => (
            <div
              key={store.id}
              className="flex flex-col items-center p-3 rounded-xl bg-card border hover:shadow-md transition-all duration-200 cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-lg overflow-hidden mb-2 bg-muted flex items-center justify-center">
                {store.logo ? (
                  <img
                    src={store.logo}
                    alt={store.name}
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-200"
                  />
                ) : (
                  <span className="text-xl font-bold text-muted-foreground">
                    {store.name.charAt(0)}
                  </span>
                )}
              </div>
              <p className="text-xs font-medium text-center line-clamp-2">
                {store.name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TopGroceryStores;
