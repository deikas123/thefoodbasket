
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import AdminProductsTable from "@/components/admin/ProductsTable";
import { getProducts } from "@/services/product";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";

const Products = () => {
  const { data: products, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-products"],
    queryFn: () => getProducts(),
    meta: {
      onError: (error) => {
        console.error('Failed to fetch products:', error);
        toast({
          title: 'Error loading products',
          description: 'There was an issue fetching the product data',
          variant: 'destructive'
        });
      }
    }
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
        {error ? (
          <div className="p-6 text-center">
            <p className="text-red-500 mb-2">Failed to load products</p>
            <button 
              onClick={() => refetch()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
            >
              Try Again
            </button>
          </div>
        ) : isLoading ? (
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
