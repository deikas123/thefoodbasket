import React from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Home, Store, ChevronRight } from "lucide-react";

// Fetch categories directly with both id and slug
const fetchCategoriesWithIds = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, slug');
  
  if (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
  
  return data || [];
};

const ShopNavbar = () => {
  const [searchParams] = useSearchParams();
  const currentCategory = searchParams.get("category") || "";

  const { data: categories = [] } = useQuery({
    queryKey: ["categories-with-ids"],
    queryFn: fetchCategoriesWithIds,
  });

  return (
    <nav className="hidden md:block bg-card border-b sticky top-[73px] z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-1 py-2 overflow-x-auto scrollbar-hide">
          {/* Home Link */}
          <Link
            to="/"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors whitespace-nowrap"
          >
            <Home className="h-4 w-4" />
            Home
          </Link>

          <ChevronRight className="h-4 w-4 text-muted-foreground/50 flex-shrink-0" />

          {/* All Products */}
          <Link
            to="/shop"
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
              !currentCategory
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <Store className="h-4 w-4" />
            All Products
          </Link>

          {/* Separator */}
          <div className="h-5 w-px bg-border mx-2 flex-shrink-0" />

          {/* Category Links - use UUID id for filtering */}
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/shop?category=${category.id}`}
              className={cn(
                "px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
                currentCategory === category.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {category.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default ShopNavbar;
