
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getProducts, getCategories } from "@/services/productService";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { FilterX, Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ProductType } from "@/types/supabase";

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Extract filter values from URL params
  const initialCategory = searchParams.get("category") || "";
  const initialSearch = searchParams.get("search") || "";
  const initialMinPrice = Number(searchParams.get("minPrice")) || 0;
  const initialMaxPrice = Number(searchParams.get("maxPrice")) || 1000; // Increased max price
  const initialInStock = searchParams.get("inStock") === "true";
  const initialSort = searchParams.get("sort") || "name_asc";
  
  // State for filters
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [priceRange, setPriceRange] = useState<[number, number]>([initialMinPrice, initialMaxPrice]);
  const [inStockOnly, setInStockOnly] = useState(initialInStock);
  const [sortOption, setSortOption] = useState(initialSort);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  
  // Fetch categories
  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories
  });
  
  // Fetch products with filters - fixed to ensure all products are fetched
  const productsQuery = useQuery({
    queryKey: ["products", selectedCategory, searchTerm, priceRange, inStockOnly],
    queryFn: () => getProducts(
      selectedCategory || undefined,
      searchTerm || undefined,
      priceRange[0],
      priceRange[1],
      inStockOnly
    )
  });
  
  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (selectedCategory) params.set("category", selectedCategory);
    if (searchTerm) params.set("search", searchTerm);
    if (priceRange[0] > 0) params.set("minPrice", priceRange[0].toString());
    if (priceRange[1] < 1000) params.set("maxPrice", priceRange[1].toString());
    if (inStockOnly) params.set("inStock", "true");
    params.set("sort", sortOption);
    
    setSearchParams(params);
  }, [selectedCategory, searchTerm, priceRange, inStockOnly, sortOption, setSearchParams]);
  
  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const search = formData.get("search") as string;
    setSearchTerm(search);
  };
  
  // Handle clearing all filters
  const clearFilters = () => {
    setSelectedCategory("");
    setSearchTerm("");
    setPriceRange([0, 100]);
    setInStockOnly(false);
    setSortOption("name_asc");
  };
  
  // Sort products
  const sortProducts = (products: ProductType[]) => {
    const sortedProducts = [...products];
    
    switch (sortOption) {
      case "name_asc":
        return sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
      case "name_desc":
        return sortedProducts.sort((a, b) => b.name.localeCompare(a.name));
      case "price_asc":
        return sortedProducts.sort((a, b) => a.price - b.price);
      case "price_desc":
        return sortedProducts.sort((a, b) => b.price - a.price);
      default:
        return sortedProducts;
    }
  };
  
  const sortedProducts = productsQuery.data ? sortProducts(productsQuery.data) : [];
  
  // Filter UI component (shared between desktop and mobile)
  const FiltersContent = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Categories</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Checkbox 
              id="all-categories" 
              checked={selectedCategory === ""}
              onCheckedChange={() => setSelectedCategory("")}
            />
            <Label htmlFor="all-categories">All Categories</Label>
          </div>
          
          {categoriesQuery.data && categoriesQuery.data.map(category => (
            <div key={category.id} className="flex items-center gap-2">
              <Checkbox 
                id={`category-${category.id}`}
                checked={selectedCategory === category.id}
                onCheckedChange={() => setSelectedCategory(category.id)}
              />
              <Label htmlFor={`category-${category.id}`}>
                {category.name} ({category.productCount || 0})
              </Label>
            </div>
          ))}
        </div>
      </div>
      
      <Separator />
      
      <div>
        <h3 className="text-lg font-medium mb-4">Price Range</h3>
        <Slider
          defaultValue={priceRange}
          value={priceRange}
          max={1000} // Increased max price slider range
          step={10}
          onValueChange={(value) => setPriceRange(value as [number, number])}
          className="mb-6"
        />
        <div className="flex items-center justify-between">
          <span>${priceRange[0]}</span>
          <span>${priceRange[1]}</span>
        </div>
      </div>
      
      <Separator />
      
      <div>
        <h3 className="text-lg font-medium mb-2">Availability</h3>
        <div className="flex items-center gap-2">
          <Checkbox 
            id="in-stock"
            checked={inStockOnly}
            onCheckedChange={(checked) => setInStockOnly(checked === true)}
          />
          <Label htmlFor="in-stock">Show In-Stock Only</Label>
        </div>
      </div>
      
      <Button 
        variant="outline" 
        className="w-full mt-4"
        onClick={clearFilters}
      >
        <FilterX className="mr-2 h-4 w-4" />
        Clear Filters
      </Button>
    </div>
  );
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Desktop Filters Sidebar */}
            <aside className="hidden lg:block">
              <div className="sticky top-24 p-6 border rounded-lg shadow-sm">
                <h2 className="text-xl font-bold mb-6">Filters</h2>
                <FiltersContent />
              </div>
            </aside>
            
            {/* Products Grid */}
            <div className="lg:col-span-3 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                {/* Search Bar */}
                <form 
                  onSubmit={handleSearch}
                  className="flex w-full max-w-sm items-center space-x-2"
                >
                  <Input
                    type="search"
                    name="search"
                    placeholder="Search products..."
                    defaultValue={searchTerm}
                    className="flex-1"
                  />
                  <Button type="submit">
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </form>
                
                <div className="flex gap-2">
                  {/* Mobile Filters Button */}
                  <Sheet open={isMobileFilterOpen} onOpenChange={setIsMobileFilterOpen}>
                    <SheetTrigger asChild>
                      <Button variant="outline" className="lg:hidden">
                        Filters
                      </Button>
                    </SheetTrigger>
                    <SheetContent>
                      <SheetHeader>
                        <SheetTitle>Filters</SheetTitle>
                        <SheetDescription>
                          Refine your product search
                        </SheetDescription>
                      </SheetHeader>
                      <div className="py-6">
                        <FiltersContent />
                      </div>
                    </SheetContent>
                  </Sheet>
                  
                  {/* Sort Dropdown */}
                  <Select value={sortOption} onValueChange={setSortOption}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name_asc">Name (A-Z)</SelectItem>
                      <SelectItem value="name_desc">Name (Z-A)</SelectItem>
                      <SelectItem value="price_asc">Price (Low to High)</SelectItem>
                      <SelectItem value="price_desc">Price (High to Low)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Results Info */}
              <div className="flex justify-between items-center">
                <p className="text-muted-foreground">
                  {productsQuery.isLoading 
                    ? 'Loading products...'
                    : `Showing ${sortedProducts.length} products`
                  }
                </p>
                
                {/* Active Filters */}
                {(selectedCategory || searchTerm || priceRange[0] > 0 || priceRange[1] < 100 || inStockOnly) && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearFilters}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <FilterX className="h-4 w-4 mr-2" />
                    Clear Filters
                  </Button>
                )}
              </div>
              
              {/* Product Grid */}
              {productsQuery.isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="border rounded-lg p-4 space-y-4">
                      <Skeleton className="h-48 w-full rounded-md" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <div className="flex justify-between">
                        <Skeleton className="h-8 w-20" />
                        <Skeleton className="h-8 w-8 rounded-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : sortedProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-xl font-medium mb-2">No products found</h3>
                  <p className="text-muted-foreground mb-6">
                    Try adjusting your filters or search terms
                  </p>
                  <Button onClick={clearFilters}>Clear Filters</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Shop;
