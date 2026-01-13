
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Search, Save, DollarSign, Percent } from "lucide-react";
import { formatCurrency } from "@/utils/currencyFormatter";

interface StorePricingProps {
  storeId: string | null;
}

const StorePricing: React.FC<StorePricingProps> = ({ storeId }) => {
  const [search, setSearch] = useState("");
  const [priceUpdates, setPriceUpdates] = useState<Record<string, { price?: number; discount?: number }>>({});
  const queryClient = useQueryClient();

  const { data: products, isLoading } = useQuery({
    queryKey: ["store-pricing", storeId, search],
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

  const updatePricingMutation = useMutation({
    mutationFn: async ({ productId, price, discount }: { productId: string; price?: number; discount?: number }) => {
      const updates: any = {};
      if (price !== undefined) updates.price = price;
      if (discount !== undefined) updates.discount_percentage = discount;

      const { error } = await supabase
        .from("products")
        .update(updates)
        .eq("id", productId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store-pricing"] });
      toast.success("Pricing updated successfully");
    },
    onError: () => {
      toast.error("Failed to update pricing");
    },
  });

  const handlePriceChange = (productId: string, field: "price" | "discount", value: string) => {
    const numValue = parseFloat(value) || 0;
    setPriceUpdates(prev => ({
      ...prev,
      [productId]: { ...prev[productId], [field]: numValue }
    }));
  };

  const handleSave = (productId: string) => {
    const updates = priceUpdates[productId];
    if (updates) {
      updatePricingMutation.mutate({
        productId,
        price: updates.price,
        discount: updates.discount
      });
      setPriceUpdates(prev => {
        const next = { ...prev };
        delete next[productId];
        return next;
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Product Pricing</h1>
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
            <DollarSign className="h-5 w-5" />
            Manage Prices & Discounts
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
                        {(product.category as any)?.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        value={priceUpdates[product.id]?.price ?? product.price}
                        onChange={(e) => handlePriceChange(product.id, "price", e.target.value)}
                        className="w-28"
                        min={0}
                        step={0.01}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Percent className="h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        value={priceUpdates[product.id]?.discount ?? (product.discount_percentage || 0)}
                        onChange={(e) => handlePriceChange(product.id, "discount", e.target.value)}
                        className="w-20"
                        min={0}
                        max={100}
                      />
                    </div>
                    {priceUpdates[product.id] && (
                      <Button
                        size="sm"
                        onClick={() => handleSave(product.id)}
                        disabled={updatePricingMutation.isPending}
                      >
                        <Save className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                    )}
                    {product.discount_percentage && product.discount_percentage > 0 && (
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                        {product.discount_percentage}% off
                      </span>
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

export default StorePricing;
