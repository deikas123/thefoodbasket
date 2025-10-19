
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getProducts, getCategories } from "@/services/productService";
import { supabase } from "@/integrations/supabase/client";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import TopGroceryStores from "@/components/home/TopGroceryStores";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Search, SlidersHorizontal, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductType } from "@/types/supabase";
import { Badge } from "@/components/ui/badge";

const Shop = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Extract filter values from URL params
  const initialCategory = searchParams.get("category") || "";
  const initialSearch = searchParams.get("search") || "";
  const initialSort = searchParams.get("sort") || "";
  const initialStore = searchParams.get("store") || "";
  
  // State for filters
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [sortOption, setSortOption] = useState(initialSort);
  const [selectedStore, setSelectedStore] = useState(initialStore);
  const [showFilters, setShowFilters] = useState(false);
  
  // Fetch categories
  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories
  });

  // Fetch stores
  const storesQuery = useQuery({
    queryKey: ["stores"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stores")
        .select("*")
        .eq("active", true)
        .order("name");
      if (error) throw error;
      return data;
    }
  });
  
  // Fetch products with filters
  const productsQuery = useQuery({
    queryKey: ["products", selectedCategory, searchTerm, selectedStore],
    queryFn: async () => {
      return getProducts(
        selectedCategory || undefined,
        searchTerm || undefined,
        0,
        50000,
        false
      );
    }
  });
  
  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategory) params.set("category", selectedCategory);
    if (searchTerm) params.set("search", searchTerm);
    if (sortOption) params.set("sort", sortOption);
    if (selectedStore) params.set("store", selectedStore);
    setSearchParams(params);
  }, [selectedCategory, searchTerm, sortOption, selectedStore, setSearchParams]);
  
  // Update search term when URL changes
  useEffect(() => {
    const urlSearchTerm = searchParams.get("search") || "";
    if (urlSearchTerm !== searchTerm) {
      setSearchTerm(urlSearchTerm);
    }
  }, [searchParams, searchTerm]);
  
  // Handle clearing all filters
  const clearFilters = () => {
    setSelectedCategory("");
    setSearchTerm("");
    setSortOption("");
    setSelectedStore("");
  };
  
  // Filter and sort products
  const filteredProducts = productsQuery.data || [];

  const sortProducts = (products: ProductType[]) => {
    const sorted = [...products];
    if (sortOption === "price_asc") return sorted.sort((a, b) => a.price - b.price);
    if (sortOption === "price_desc") return sorted.sort((a, b) => b.price - a.price);
    return sorted;
  };
  
  const sortedProducts = sortProducts(filteredProducts);
  
  const activeFiltersCount = [selectedCategory, sortOption, selectedStore].filter(Boolean).length;
  
  return (
    <div className="flex flex-col min-h-screen bg-background pb-20">
      {/* Header with back button and search */}
      <header className="sticky top-0 z-50 bg-background border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="h-9 w-9"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Would you like to eat something?"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-lg bg-muted border-0 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Filter chips */}
      <div className="sticky top-[61px] z-40 bg-background border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            <Button
              variant={showFilters ? "default" : "outline"}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex-shrink-0 h-8 gap-1.5"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              {sortOption && <span className="text-xs">Sort by</span>}
            </Button>

            {categoriesQuery.data?.slice(0, 5).map((category) => (
              <Badge
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                className="flex-shrink-0 cursor-pointer h-8 px-3"
                onClick={() => setSelectedCategory(selectedCategory === category.id ? "" : category.id)}
              >
                {category.name}
              </Badge>
            ))}

            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="flex-shrink-0 h-8 gap-1"
              >
                <X className="h-3.5 w-3.5" />
                Clear
              </Button>
            )}
          </div>

          {/* Sort options dropdown */}
          {showFilters && (
            <div className="mt-3 flex gap-2">
              <Badge
                variant={sortOption === "price_asc" ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSortOption(sortOption === "price_asc" ? "" : "price_asc")}
              >
                Price: Low to High
              </Badge>
              <Badge
                variant={sortOption === "price_desc" ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSortOption(sortOption === "price_desc" ? "" : "price_desc")}
              >
                Price: High to Low
              </Badge>
            </div>
          )}
        </div>
      </div>

      <main className="flex-grow">
        {/* Top Grocery Stores */}
        <TopGroceryStores />

        {/* Products Section */}
        <section className="py-6">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Top Items 2025</h2>
              <button className="text-sm text-primary hover:underline">View all</button>
            </div>
            
            {productsQuery.isLoading ? (
              <div className="grid grid-cols-2 gap-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-card rounded-xl p-3">
                    <Skeleton className="aspect-square w-full rounded-lg mb-2" />
                    <Skeleton className="h-4 w-16 mb-1" />
                    <Skeleton className="h-3 w-full mb-1" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                ))}
              </div>
            ) : sortedProducts.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {sortedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No products found</p>
                <Button onClick={clearFilters} className="mt-4" size="sm">
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Shop;
