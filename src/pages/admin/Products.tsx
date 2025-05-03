
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import AdminProductsTable from "@/components/admin/ProductsTable";
import { getProducts } from "@/services/product";

const Products = () => {
  const [isLoading, setIsLoading] = useState(false);
  const productsQuery = useQuery({
    queryKey: ["admin-products"],
    queryFn: getProducts
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
        <AdminProductsTable />
      </Card>
    </div>
  );
};

export default Products;
