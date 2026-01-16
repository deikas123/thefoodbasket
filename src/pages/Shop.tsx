
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getProducts, getCategories } from "@/services/productService";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import TopGroceryStores from "@/components/home/TopGroceryStores";
import ShopNavbar from "@/components/shop/ShopNavbar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Search, SlidersHorizontal, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductType } from "@/types/supabase";
import { Badge } from "@/components/ui/badge";
import BottomNavigation from "@/components/mobile/BottomNavigation";

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
    <div className="flex flex-col min-h-screen bg-background pb-20 md:pb-0">
      {/* Desktop Header */}
      <div className="hidden md:block">
        <Header />
      </div>
      
      {/* Mobile Header with back button and search */}
      <header className="md:hidden sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="h-10 w-10 rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search for fresh groceries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-12 pl-12 pr-4 rounded-2xl bg-muted/50 border-0 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm transition-all"
              />
            </div>
          </div>
        </div>
      </header>
      
      {/* Desktop Shop Navbar */}
      <ShopNavbar />

      <main className="flex-grow">
        {/* Top Grocery Stores */}
        <TopGroceryStores />

        {/* Products Section */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-1">Top Items 2025</h2>
                <p className="text-sm text-muted-foreground">{sortedProducts.length} products available</p>
              </div>
            </div>
            
            {productsQuery.isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-card rounded-2xl p-4 shadow-sm">
                    <Skeleton className="aspect-square w-full rounded-xl mb-3" />
                    <Skeleton className="h-5 w-20 mb-2" />
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                ))}
              </div>
            ) : sortedProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {sortedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-muted/30 rounded-2xl">
                <p className="text-muted-foreground text-lg mb-2">No products found</p>
                <p className="text-sm text-muted-foreground mb-4">Try adjusting your search or filters</p>
                <Button onClick={clearFilters} size="lg" className="rounded-full">
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>
        </section>
      </main>
      
      <Footer />
      <BottomNavigation />
    </div>
  );
};

export default Shop;
