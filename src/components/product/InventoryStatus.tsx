import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface InventoryStatusProps {
  productId: string;
  stock: number;
  className?: string;
}

const InventoryStatus = ({ productId, stock, className = "" }: InventoryStatusProps) => {
  const [currentStock, setCurrentStock] = useState(stock);

  useEffect(() => {
    // Subscribe to real-time stock updates
    const channel = supabase
      .channel(`stock-${productId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'products',
          filter: `id=eq.${productId}`
        },
        (payload) => {
          if (payload.new && 'stock' in payload.new) {
            setCurrentStock(payload.new.stock as number);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [productId]);

  const getStockStatus = () => {
    if (currentStock === 0) {
      return {
        label: "Out of Stock",
        variant: "destructive" as const,
        icon: XCircle
      };
    } else if (currentStock <= 5) {
      return {
        label: `Low Stock (${currentStock} left)`,
        variant: "secondary" as const,
        icon: AlertTriangle
      };
    } else {
      return {
        label: "In Stock",
        variant: "default" as const,
        icon: CheckCircle
      };
    }
  };

  const status = getStockStatus();
  const Icon = status.icon;

  return (
    <Badge variant={status.variant} className={`flex items-center gap-1 ${className}`}>
      <Icon className="h-3 w-3" />
      {status.label}
    </Badge>
  );
};

export default InventoryStatus;