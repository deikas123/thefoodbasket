
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import AdminProductsTable from "@/components/admin/ProductsTable";
import { getProducts } from "@/services/product";
import { Skeleton } from "@/components/ui/skeleton";

const Products = () => {
  const { data: products, isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: () => getProducts()
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Products</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Manage Products</CardTitle>
        </CardHeader>
        {isLoading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-8 w-full max-w-sm" />
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </div>
        ) : (
          <AdminProductsTable />
        )}
      </Card>
    </div>
  );
};

export default Products;
