import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, Package, Settings, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getProductById } from "@/services/productService";
import { formatCurrency } from "@/utils/currencyFormatter";
import { convertProductTypeToProduct } from "@/utils/productHelpers";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";

interface AutoReplenishItem {
  id: string;
  product_id: string;
  quantity: number;
  frequency_days: number;
  next_order_date: string;
  active: boolean;
  custom_days: string[] | null;
  custom_time: string | null;
}

const AutoReplenish = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<AutoReplenishItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { data: itemsWithProducts, isLoading: isLoadingItems } = useQuery({
    queryKey: ["auto-replenish-items", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data: items, error } = await supabase
        .from("auto_replenish_items")
        .select("*")
        .eq("user_id", user.id)
        .eq("active", true);

      if (error) throw error;

      const itemsWithProducts = await Promise.all(
        items.map(async (item) => {
          const product = await getProductById(item.product_id);
          return {
            ...item,
            product: product ? convertProductTypeToProduct(product) : null,
          };
        })
      );

      return itemsWithProducts;
    },
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const fetchItems = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("auto_replenish_items")
          .select("*")
          .eq("user_id", user.id)
          .eq("active", true);

        if (error) {
          throw error;
        }

        setItems(data || []);
      } catch (error: any) {
        toast.error(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchItems();
  }, [user]);

  const handleToggleActive = async (id: string, active: boolean) => {
    try {
      const { error } = await supabase
        .from("auto_replenish_items")
        .update({ active: !active })
        .eq("id", id);

      if (error) {
        throw error;
      }

      setItems((prevItems) =>
        prevItems.map((item) =>
          item.id === id ? { ...item, active: !active } : item
        )
      );
      toast.success(`Auto-replenish item ${active ? "deactivated" : "activated"}`);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      const { error } = await supabase
        .from("auto_replenish_items")
        .delete()
        .eq("id", id);

      if (error) {
        throw error;
      }

      setItems((prevItems) => prevItems.filter((item) => item.id !== id));
      toast.success("Auto-replenish item deleted");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 pt-32">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Auto Replenish</h1>
              <p className="text-muted-foreground mt-2">
                Automatically reorder your essentials
              </p>
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </div>

          {isLoadingItems ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <Skeleton className="h-16 w-16 rounded-md" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : itemsWithProducts && itemsWithProducts.length > 0 ? (
            <div className="space-y-4">
              {itemsWithProducts.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {item.product && (
                          <>
                            <img
                              src={item.product.image}
                              alt={item.product.name}
                              className="h-16 w-16 object-cover rounded-md"
                            />
                            <div>
                              <h3 className="font-semibold">{item.product.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                Quantity: {item.quantity} • {formatCurrency(item.product.price * item.quantity)}
                              </p>
                              <div className="flex items-center space-x-2 mt-2">
                                <Badge variant="secondary">
                                  <Clock className="mr-1 h-3 w-3" />
                                  Every {item.frequency_days} days
                                </Badge>
                                <Badge variant="outline">
                                  <Calendar className="mr-1 h-3 w-3" />
                                  Next: {new Date(item.next_order_date).toLocaleDateString()}
                                </Badge>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Auto Replenish Items</h3>
                <p className="text-muted-foreground mb-4">
                  Start by adding products you want to automatically reorder.
                </p>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Item
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AutoReplenish;
