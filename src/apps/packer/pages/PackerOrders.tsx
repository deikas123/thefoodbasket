
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Package, CheckCircle, Truck } from "lucide-react";

const PackerOrders = () => {
  const queryClient = useQueryClient();
  const { data: orders, isLoading } = useQuery({
    queryKey: ["packer-orders"],
    queryFn: async () => {
      const { data } = await supabase.from("orders").select("*").in("status", ["pending", "processing"]).order("created_at");
      return data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await supabase.from("orders").update({ status }).eq("id", id);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["packer-orders"] }); toast.success("Updated!"); },
  });

  if (isLoading) return <div className="space-y-4">{[...Array(3)].map((_, i) => <Card key={i} className="animate-pulse h-24" />)}</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Order Queue</h1>
      {!orders?.length ? <Card><CardContent className="py-12 text-center text-muted-foreground">No orders to pack</CardContent></Card> : (
        <div className="space-y-4">
          {orders.map((order) => {
            const items = order.items as any[];
            return (
              <Card key={order.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="font-mono">#{order.id.slice(0,8)}</CardTitle>
                    <Badge className={order.status === "processing" ? "bg-blue-100 text-blue-800" : "bg-yellow-100 text-yellow-800"}>{order.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-3">{items?.map((item: any, i: number) => <div key={i} className="flex justify-between text-sm py-1 border-b last:border-0"><span>{item.name}</span><span className="font-medium">x{item.quantity}</span></div>)}</div>
                  <div className="flex gap-2">
                    {order.status === "pending" && <Button size="sm" onClick={() => updateMutation.mutate({ id: order.id, status: "processing" })}><Package className="h-4 w-4 mr-1" />Start Packing</Button>}
                    {order.status === "processing" && <Button size="sm" className="bg-green-600" onClick={() => updateMutation.mutate({ id: order.id, status: "dispatched" })}><Truck className="h-4 w-4 mr-1" />Ready for Pickup</Button>}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PackerOrders;
