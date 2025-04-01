
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getProducts, getCategoryById } from "@/services/productService";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const Category = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [page, setPage] = useState(1);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const itemsPerPage = 12;

  // Fetch category details
  const categoryQuery = useQuery({
    queryKey: ["category", categoryId],
    queryFn: () => getCategoryById(categoryId || ""),
    enabled: !!categoryId,
  });

  // Fetch products in this category
  const productsQuery = useQuery({
    queryKey: ["products", categoryId, priceRange, inStockOnly],
    queryFn: () => getProducts(
      categoryId,
      undefined,
      priceRange[0],
      priceRange[1],
      inStockOnly
    ),
  });

  // Calculate pagination
  const totalProducts = productsQuery.data?.length || 0;
  const totalPages = Math.ceil(totalProducts / itemsPerPage);
  const paginatedProducts = productsQuery.data?.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [categoryId, priceRange, inStockOnly]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Category Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Link to="/" className="text-muted-foreground hover:text-foreground text-sm">
                Home
              </Link>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <Link to="/shop" className="text-muted-foreground hover:text-foreground text-sm">
                Shop
              </Link>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                {categoryQuery.isLoading ? (
                  <Skeleton className="h-4 w-20" />
                ) : (
                  categoryQuery.data?.name || "Category"
                )}
              </span>
            </div>
            
            <h1 className="text-3xl font-bold">
              {categoryQuery.isLoading ? (
                <Skeleton className="h-10 w-48" />
              ) : (
                categoryQuery.data?.name || "Category"
              )}
            </h1>
          </div>
          
          {/* Main Content */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters - Only on desktop */}
            <div className="hidden lg:block w-64 shrink-0">
              <div className="sticky top-24 p-6 border rounded-lg shadow-sm space-y-6">
                <div>
                  <h3 className="font-medium mb-3">Price Range</h3>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">KES {priceRange[0]}</span>
                    <span className="text-sm text-muted-foreground">KES {priceRange[1]}</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="10000" 
                    step="100"
                    value={priceRange[1]} 
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full"
                  />
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-medium mb-3">Availability</h3>
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="in-stock" 
                      checked={inStockOnly}
                      onChange={(e) => setInStockOnly(e.target.checked)}
                      className="rounded"
                    />
                    <label htmlFor="in-stock" className="text-sm">In Stock Only</label>
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setPriceRange([0, 10000]);
                    setInStockOnly(false);
                  }}
                >
                  Reset Filters
                </Button>
              </div>
            </div>
            
            {/* Products Grid */}
            <div className="flex-1">
              {/* Mobile Filter Button */}
              <div className="flex justify-between items-center mb-6 lg:hidden">
                <span className="text-sm text-muted-foreground">
                  {productsQuery.isLoading ? 
                    "Loading products..." : 
                    `Showing ${totalProducts} products`
                  }
                </span>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
              
              {productsQuery.isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
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
              ) : paginatedProducts && paginatedProducts.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {paginatedProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                  
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-8">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(Math.max(1, page - 1))}
                        disabled={page === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      
                      {[...Array(totalPages)].map((_, i) => (
                        <Button
                          key={i}
                          variant={page === i + 1 ? "default" : "outline"}
                          size="sm"
                          onClick={() => setPage(i + 1)}
                        >
                          {i + 1}
                        </Button>
                      ))}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(Math.min(totalPages, page + 1))}
                        disabled={page === totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-xl font-medium mb-2">No products found</h3>
                  <p className="text-muted-foreground mb-6">
                    Try adjusting your filters or check back later
                  </p>
                  <Button onClick={() => {
                    setPriceRange([0, 10000]);
                    setInStockOnly(false);
                  }}>
                    Reset Filters
                  </Button>
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

export default Category;
