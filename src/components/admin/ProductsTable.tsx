
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Edit, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { products } from "@/data/products";
import { Product } from "@/types";
import ProductFormDialog from "./ProductFormDialog";

const AdminProductsTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // In a real application, this would fetch data from an API
  const { data: allProducts, isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: () => {
      // This is using mock data, but would be a fetch call in a real app
      return Promise.resolve(products);
    }
  });
  
  const filteredProducts = allProducts?.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleNewProduct = () => {
    setEditingProduct(null);
    setShowDialog(true);
  };
  
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowDialog(true);
  };
  
  const handleDeleteProduct = (productId: string) => {
    // In a real app, this would call an API to delete the product
    toast({
      title: "Product deleted",
      description: "The product has been removed successfully.",
    });
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Products Management</CardTitle>
        <Button onClick={handleNewProduct}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex items-center mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        
        {isLoading ? (
          <div className="text-center p-4">Loading products...</div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price (KSh)</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts?.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="h-10 w-10 rounded-md object-cover"
                        />
                        {product.name}
                      </div>
                    </TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>{(product.price * 130).toFixed(2)}</TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell>
                      {product.stock > 0 ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          In Stock
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                          Out of Stock
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleEditProduct(product)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                
                {filteredProducts?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      No products found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
        
        <ProductFormDialog 
          open={showDialog}
          onOpenChange={setShowDialog}
          product={editingProduct}
        />
      </CardContent>
    </Card>
  );
};

export default AdminProductsTable;
