
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { getFlashSaleAnalytics } from "@/services/flashSaleAnalyticsService";
import { formatCurrency } from "@/utils/currencyFormatter";
import { Zap, TrendingUp, Package, ShoppingCart } from "lucide-react";
import { BarChart } from "@/components/ui/chart";

const FlashSaleAnalyticsWidget = () => {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["flash-sale-analytics"],
    queryFn: getFlashSaleAnalytics,
    staleTime: 2 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-1/3 mb-2" />
          <div className="h-4 bg-muted rounded w-1/2" />
        </CardHeader>
        <CardContent>
          <div className="h-48 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-orange-200 dark:border-orange-800 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-orange-500" />
          <CardTitle>Flash Sale Analytics</CardTitle>
        </div>
        <CardDescription>Real-time performance metrics for flash sales</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-background/50 rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Zap className="h-4 w-4 text-orange-500" />
              <span className="text-xs font-medium">Active Sales</span>
            </div>
            <p className="text-2xl font-bold">{analytics?.activeFlashSales || 0}</p>
          </div>
          
          <div className="bg-white dark:bg-background/50 rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Package className="h-4 w-4 text-blue-500" />
              <span className="text-xs font-medium">Products Sold</span>
            </div>
            <p className="text-2xl font-bold">{analytics?.totalProductsSold || 0}</p>
          </div>
          
          <div className="bg-white dark:bg-background/50 rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-xs font-medium">Flash Revenue</span>
            </div>
            <p className="text-2xl font-bold">{formatCurrency(analytics?.totalRevenue || 0)}</p>
          </div>
          
          <div className="bg-white dark:bg-background/50 rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <ShoppingCart className="h-4 w-4 text-purple-500" />
              <span className="text-xs font-medium">Avg/Product</span>
            </div>
            <p className="text-2xl font-bold">
              {analytics?.totalProductsSold && analytics.totalProductsSold > 0
                ? formatCurrency(analytics.totalRevenue / analytics.totalProductsSold)
                : formatCurrency(0)}
            </p>
          </div>
        </div>

        {/* Sales by Flash Sale Chart */}
        {analytics?.salesByFlashSale && analytics.salesByFlashSale.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-3">Revenue by Flash Sale</h4>
            <BarChart
              data={analytics.salesByFlashSale.map(fs => ({
                name: fs.name.length > 15 ? fs.name.substring(0, 15) + '...' : fs.name,
                value: fs.revenue
              }))}
              xAxisKey="name"
              yAxisKey="value"
              height={200}
            />
          </div>
        )}

        {/* Top Products */}
        {analytics?.topProducts && analytics.topProducts.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-3">Top Flash Sale Products</h4>
            <div className="space-y-2">
              {analytics.topProducts.slice(0, 3).map((product, index) => (
                <div 
                  key={product.id} 
                  className="flex items-center justify-between bg-white dark:bg-background/50 rounded-lg p-3 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-orange-500">#{index + 1}</span>
                    <div>
                      <p className="font-medium text-sm">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.quantitySold} sold</p>
                    </div>
                  </div>
                  <span className="font-semibold text-green-600">{formatCurrency(product.revenue)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {!analytics?.topProducts?.length && !analytics?.salesByFlashSale?.length && (
          <div className="text-center py-8 text-muted-foreground">
            <Zap className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No flash sale data yet</p>
            <p className="text-sm">Create a flash sale to see analytics here</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FlashSaleAnalyticsWidget;
