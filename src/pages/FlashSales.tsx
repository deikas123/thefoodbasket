import { useState, useEffect, memo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Zap, Clock, Filter, ArrowRight } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProductType } from '@/types/supabase';
import { supabase } from '@/integrations/supabase/client';
import { FlashSaleWithProducts } from '@/services/flashSaleService';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const calculateTimeLeft = (endDate: string): TimeLeft => {
  const difference = new Date(endDate).getTime() - new Date().getTime();
  
  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  
  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
};

const CountdownTimer = memo(({ endDate, color = '#ef4444' }: { endDate: string; color?: string }) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft(endDate));
  
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(endDate));
    }, 1000);
    
    return () => clearInterval(timer);
  }, [endDate]);
  
  const timeBlocks = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Mins', value: timeLeft.minutes },
    { label: 'Secs', value: timeLeft.seconds },
  ];
  
  return (
    <div className="flex items-center gap-2">
      {timeBlocks.map((block, i) => (
        <div key={block.label} className="flex items-center gap-1">
          <div 
            className="flex flex-col items-center px-3 py-2 rounded-lg text-white min-w-[50px]"
            style={{ backgroundColor: color }}
          >
            <span className="text-lg font-bold font-mono">{block.value.toString().padStart(2, '0')}</span>
            <span className="text-[10px] uppercase opacity-80">{block.label}</span>
          </div>
          {i < timeBlocks.length - 1 && (
            <span className="text-xl font-bold" style={{ color }}>:</span>
          )}
        </div>
      ))}
    </div>
  );
});

CountdownTimer.displayName = "CountdownTimer";

const FlashSaleCard = memo(({ sale }: { sale: FlashSaleWithProducts }) => {
  const bannerColor = sale.banner_color || '#ef4444';
  const products = sale.products
    .filter(p => p.product)
    .map(sp => ({
      ...sp.product!,
      discount_percentage: sale.discount_percentage,
    }));
  
  return (
    <div className="bg-card rounded-2xl border overflow-hidden">
      <div 
        className="p-6 relative overflow-hidden"
        style={{ 
          background: `linear-gradient(135deg, ${bannerColor}20 0%, ${bannerColor}05 100%)` 
        }}
      >
        <div 
          className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-30"
          style={{ backgroundColor: bannerColor }}
        />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div 
              className="p-2 rounded-lg"
              style={{ backgroundColor: `${bannerColor}30` }}
            >
              <Zap className="h-6 w-6" style={{ color: bannerColor }} />
            </div>
            <div>
              <h3 className="text-xl font-bold">{sale.name}</h3>
              {sale.description && (
                <p className="text-muted-foreground text-sm">{sale.description}</p>
              )}
              <Badge 
                className="mt-2 text-white"
                style={{ backgroundColor: bannerColor }}
              >
                {sale.discount_percentage}% OFF
              </Badge>
            </div>
          </div>
          
          <div className="flex flex-col items-start md:items-end gap-2">
            <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <Clock className="h-4 w-4" /> Ends in:
            </span>
            <CountdownTimer endDate={sale.end_date} color={bannerColor} />
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.slice(0, 8).map(product => (
            <ProductCard key={product.id} product={product as ProductType} />
          ))}
        </div>
        
        {products.length > 8 && (
          <div className="text-center mt-6">
            <Button variant="outline" className="gap-2">
              View All {products.length} Products <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
});

FlashSaleCard.displayName = "FlashSaleCard";

const FlashSales = () => {
  const [activeTab, setActiveTab] = useState('active');
  
  // Fetch active flash sales
  const { data: activeSales = [], isLoading: loadingActive } = useQuery({
    queryKey: ['flash-sales-active-page'],
    queryFn: async () => {
      const now = new Date().toISOString();
      
      const { data: flashSales, error } = await supabase
        .from("flash_sales")
        .select("*")
        .eq("active", true)
        .lte("start_date", now)
        .gte("end_date", now)
        .order("end_date", { ascending: true });
      
      if (error) throw error;
      if (!flashSales || flashSales.length === 0) return [];
      
      // Fetch products for each sale
      const salesWithProducts: FlashSaleWithProducts[] = [];
      
      for (const sale of flashSales) {
        const { data: saleProducts } = await supabase
          .from("flash_sale_products")
          .select("*")
          .eq("flash_sale_id", sale.id);
        
        if (saleProducts && saleProducts.length > 0) {
          const productIds = saleProducts.map(sp => sp.product_id);
          const { data: products } = await supabase
            .from("products")
            .select("*")
            .in("id", productIds);
          
          const productsWithDetails = saleProducts.map(sp => ({
            ...sp,
            product: products?.find(p => p.id === sp.product_id) as ProductType | undefined
          }));
          
          salesWithProducts.push({
            ...sale,
            products: productsWithDetails
          });
        }
      }
      
      return salesWithProducts;
    },
    staleTime: 1000 * 60 * 2,
  });
  
  // Fetch upcoming flash sales
  const { data: upcomingSales = [], isLoading: loadingUpcoming } = useQuery({
    queryKey: ['flash-sales-upcoming'],
    queryFn: async () => {
      const now = new Date().toISOString();
      
      const { data: flashSales, error } = await supabase
        .from("flash_sales")
        .select("*")
        .eq("active", true)
        .gt("start_date", now)
        .order("start_date", { ascending: true });
      
      if (error) throw error;
      if (!flashSales || flashSales.length === 0) return [];
      
      // Fetch products for each sale
      const salesWithProducts: FlashSaleWithProducts[] = [];
      
      for (const sale of flashSales) {
        const { data: saleProducts } = await supabase
          .from("flash_sale_products")
          .select("*")
          .eq("flash_sale_id", sale.id);
        
        if (saleProducts && saleProducts.length > 0) {
          const productIds = saleProducts.map(sp => sp.product_id);
          const { data: products } = await supabase
            .from("products")
            .select("*")
            .in("id", productIds);
          
          const productsWithDetails = saleProducts.map(sp => ({
            ...sp,
            product: products?.find(p => p.id === sp.product_id) as ProductType | undefined
          }));
          
          salesWithProducts.push({
            ...sale,
            products: productsWithDetails
          });
        }
      }
      
      return salesWithProducts;
    },
    staleTime: 1000 * 60 * 5,
  });
  
  const isLoading = loadingActive || loadingUpcoming;
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow pt-20 pb-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-destructive/10 via-background to-background py-12 md:py-20">
          <div className="container">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-destructive/20">
                <Zap className="h-8 w-8 text-destructive" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">Flash Sales</h1>
                <p className="text-muted-foreground">Limited time offers with incredible discounts</p>
              </div>
            </div>
          </div>
        </section>
        
        <div className="container py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex items-center justify-between mb-8">
              <TabsList>
                <TabsTrigger value="active" className="gap-2">
                  <Zap className="h-4 w-4" />
                  Active Sales
                  {activeSales.length > 0 && (
                    <Badge variant="secondary">{activeSales.length}</Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="upcoming" className="gap-2">
                  <Clock className="h-4 w-4" />
                  Upcoming
                  {upcomingSales.length > 0 && (
                    <Badge variant="secondary">{upcomingSales.length}</Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="active" className="mt-0">
              {isLoading ? (
                <div className="space-y-8">
                  {[1, 2].map(i => (
                    <div key={i} className="bg-card rounded-2xl border p-6">
                      <div className="flex justify-between items-center mb-6">
                        <Skeleton className="h-8 w-64" />
                        <Skeleton className="h-12 w-48" />
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(j => (
                          <Skeleton key={j} className="h-64 rounded-xl" />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : activeSales.length === 0 ? (
                <div className="text-center py-16">
                  <div className="p-4 rounded-full bg-muted w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                    <Zap className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h2 className="text-xl font-bold mb-2">No Active Flash Sales</h2>
                  <p className="text-muted-foreground mb-4">Check back soon for exciting deals!</p>
                  <Button onClick={() => setActiveTab('upcoming')} variant="outline">
                    View Upcoming Sales
                  </Button>
                </div>
              ) : (
                <div className="space-y-8">
                  {activeSales.map(sale => (
                    <FlashSaleCard key={sale.id} sale={sale} />
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="upcoming" className="mt-0">
              {isLoading ? (
                <div className="space-y-8">
                  {[1, 2].map(i => (
                    <div key={i} className="bg-card rounded-2xl border p-6">
                      <Skeleton className="h-8 w-64 mb-4" />
                      <Skeleton className="h-12 w-48" />
                    </div>
                  ))}
                </div>
              ) : upcomingSales.length === 0 ? (
                <div className="text-center py-16">
                  <div className="p-4 rounded-full bg-muted w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                    <Clock className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h2 className="text-xl font-bold mb-2">No Upcoming Flash Sales</h2>
                  <p className="text-muted-foreground">Stay tuned for future promotions!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {upcomingSales.map(sale => {
                    const bannerColor = sale.banner_color || '#ef4444';
                    const startDate = new Date(sale.start_date);
                    
                    return (
                      <div 
                        key={sale.id}
                        className="bg-card rounded-2xl border p-6 relative overflow-hidden"
                      >
                        <div 
                          className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20"
                          style={{ backgroundColor: bannerColor }}
                        />
                        
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
                          <div className="flex items-center gap-3">
                            <div 
                              className="p-2 rounded-lg"
                              style={{ backgroundColor: `${bannerColor}30` }}
                            >
                              <Clock className="h-6 w-6" style={{ color: bannerColor }} />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold">{sale.name}</h3>
                              {sale.description && (
                                <p className="text-muted-foreground text-sm">{sale.description}</p>
                              )}
                              <div className="flex items-center gap-2 mt-2">
                                <Badge 
                                  className="text-white"
                                  style={{ backgroundColor: bannerColor }}
                                >
                                  {sale.discount_percentage}% OFF
                                </Badge>
                                <Badge variant="outline">
                                  {sale.products.length} Products
                                </Badge>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground mb-1">Starts on</p>
                            <p className="text-lg font-bold">
                              {startDate.toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FlashSales;
