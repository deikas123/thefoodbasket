
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Search, Save, Package } from "lucide-react";
import { formatCurrency } from "@/utils/currencyFormatter";

interface StoreInventoryProps {
  storeId: string | null;
}

const StoreInventory: React.FC<StoreInventoryProps> = ({ storeId }) => {
  const [search, setSearch] = useState("");
  const [stockUpdates, setStockUpdates] = useState<Record<string, number>>({});
  const queryClient = useQueryClient();

  const { data: products, isLoading } = useQuery({
    queryKey: ["store-inventory", storeId, search],
    queryFn: async () => {
      let query = supabase
        .from("products")
        .select("*, category:categories(name)")
        .order("name");
      
      if (storeId) query = query.eq("store_id", storeId);
      if (search) query = query.ilike("name", `%${search}%`);

      const { data, error } = await query.limit(50);
      if (error) throw error;
      return data;
    },
  });

  const updateStockMutation = useMutation({
    mutationFn: async ({ productId, stock }: { productId: string; stock: number }) => {
      const { error } = await supabase
        .from("products")
        .update({ stock })
        .eq("id", productId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store-inventory"] });
      toast.success("Stock updated successfully");
    },
    onError: () => {
      toast.error("Failed to update stock");
    },
  });

  const handleStockChange = (productId: string, value: string) => {
    const stock = parseInt(value) || 0;
    setStockUpdates(prev => ({ ...prev, [productId]: stock }));
  };

  const handleSaveStock = (productId: string) => {
    if (stockUpdates[productId] !== undefined) {
      updateStockMutation.mutate({ productId, stock: stockUpdates[productId] });
      setStockUpdates(prev => {
        const next = { ...prev };
        delete next[productId];
        return next;
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Inventory Management</h1>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Products ({products?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {products?.map((product) => (
                <div
                  key={product.id}
                  className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(product.category as any)?.name} • {formatCurrency(product.price)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Stock:</span>
                      <Input
                        type="number"
                        value={stockUpdates[product.id] ?? product.stock}
                        onChange={(e) => handleStockChange(product.id, e.target.value)}
                        className="w-24"
                        min={0}
                      />
                    </div>
                    {stockUpdates[product.id] !== undefined && (
                      <Button
                        size="sm"
                        onClick={() => handleSaveStock(product.id)}
                        disabled={updateStockMutation.isPending}
                      >
                        <Save className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                    )}
                    {product.stock < 10 && (
                      <span className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded">Low</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StoreInventory;
