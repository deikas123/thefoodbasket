import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getStores } from "@/services/storeService";
import StoreFormDialog from "@/components/admin/stores/StoreFormDialog";
import StoresTable from "@/components/admin/stores/StoresTable";

const Stores = () => {
  const { data: stores, isLoading, refetch } = useQuery({
    queryKey: ["admin-stores"],
    queryFn: getStores,
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Stores</h1>
        <StoreFormDialog onSuccess={() => refetch()} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Stores</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <StoresTable stores={stores || []} onUpdate={() => refetch()} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Stores;
