import { useState, useEffect, memo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Zap, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

interface FlashSaleWidgetProps {
  productId: string;
}

interface TimeLeft {
  hours: number;
  minutes: number;
  seconds: number;
}

interface FlashSaleInfo {
  id: string;
  name: string;
  discount_percentage: number;
  end_date: string;
  banner_color: string | null;
  sale_price: number | null;
}

const FlashSaleWidget = memo(({ productId }: FlashSaleWidgetProps) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ hours: 0, minutes: 0, seconds: 0 });
  
  const { data: flashSaleInfo, isLoading } = useQuery({
    queryKey: ['product-flash-sale', productId],
    queryFn: async (): Promise<FlashSaleInfo | null> => {
      const now = new Date().toISOString();
      
      // Find if this product is part of an active flash sale
      const { data: saleProducts, error: productError } = await supabase
        .from("flash_sale_products")
        .select(`
          sale_price,
          flash_sale_id,
          flash_sales!inner (
            id,
            name,
            discount_percentage,
            end_date,
            banner_color,
            active,
            start_date
          )
        `)
        .eq("product_id", productId);
      
      if (productError || !saleProducts || saleProducts.length === 0) {
        return null;
      }
      
      // Filter for active sales
      const activeSale = saleProducts.find(sp => {
        const sale = sp.flash_sales as any;
        return sale.active && 
               new Date(sale.start_date) <= new Date() && 
               new Date(sale.end_date) >= new Date();
      });
      
      if (!activeSale) {
        return null;
      }
      
      const sale = activeSale.flash_sales as any;
      
      return {
        id: sale.id,
        name: sale.name,
        discount_percentage: sale.discount_percentage,
        end_date: sale.end_date,
        banner_color: sale.banner_color,
        sale_price: activeSale.sale_price,
      };
    },
    staleTime: 1000 * 60 * 2,
    enabled: !!productId,
  });
  
  useEffect(() => {
    if (!flashSaleInfo) return;
    
    const calculateTimeLeft = (): TimeLeft => {
      const difference = new Date(flashSaleInfo.end_date).getTime() - new Date().getTime();
      
      if (difference <= 0) {
        return { hours: 0, minutes: 0, seconds: 0 };
      }
      
      return {
        hours: Math.floor(difference / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      };
    };
    
    setTimeLeft(calculateTimeLeft());
    
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    
    return () => clearInterval(timer);
  }, [flashSaleInfo]);
  
  if (isLoading || !flashSaleInfo) {
    return null;
  }
  
  const bannerColor = flashSaleInfo.banner_color || '#ef4444';
  
  return (
    <div 
      className="rounded-xl p-4 relative overflow-hidden"
      style={{ 
        background: `linear-gradient(135deg, ${bannerColor}20 0%, ${bannerColor}05 100%)`,
        border: `1px solid ${bannerColor}30`
      }}
    >
      {/* Decorative element */}
      <div 
        className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-30"
        style={{ backgroundColor: bannerColor }}
      />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div 
              className="p-1.5 rounded-lg"
              style={{ backgroundColor: `${bannerColor}30` }}
            >
              <Zap className="h-4 w-4" style={{ color: bannerColor }} />
            </div>
            <span className="font-bold text-sm" style={{ color: bannerColor }}>
              Flash Sale!
            </span>
          </div>
          <Badge 
            className="text-white text-xs"
            style={{ backgroundColor: bannerColor }}
          >
            {flashSaleInfo.discount_percentage}% OFF
          </Badge>
        </div>
        
        <p className="text-sm font-medium mb-3">{flashSaleInfo.name}</p>
        
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Ends in:</span>
          <div className="flex items-center gap-1">
            <span 
              className="px-2 py-1 rounded text-white font-mono text-xs font-bold"
              style={{ backgroundColor: bannerColor }}
            >
              {timeLeft.hours.toString().padStart(2, '0')}
            </span>
            <span className="font-bold text-xs" style={{ color: bannerColor }}>:</span>
            <span 
              className="px-2 py-1 rounded text-white font-mono text-xs font-bold"
              style={{ backgroundColor: bannerColor }}
            >
              {timeLeft.minutes.toString().padStart(2, '0')}
            </span>
            <span className="font-bold text-xs" style={{ color: bannerColor }}>:</span>
            <span 
              className="px-2 py-1 rounded text-white font-mono text-xs font-bold"
              style={{ backgroundColor: bannerColor }}
            >
              {timeLeft.seconds.toString().padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

FlashSaleWidget.displayName = "FlashSaleWidget";

export default FlashSaleWidget;
