import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/utils/currencyFormatter";
import { getProducts } from "@/services/product";
import { 
  getFlashSaleById,
  addFlashSaleProduct,
  removeFlashSaleProduct,
  FlashSaleProduct
} from "@/services/flashSaleService";

interface FlashSaleProductsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  flashSaleId: string;
}

const FlashSaleProductsDialog = ({
  open,
  onOpenChange,
  flashSaleId,
}: FlashSaleProductsDialogProps) => {
  const queryClient = useQueryClient();
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [salePrice, setSalePrice] = useState<string>("");
  const [stockLimit, setStockLimit] = useState<string>("");
  
  const { data: flashSale, isLoading: isLoadingSale } = useQuery({
    queryKey: ["flash-sale", flashSaleId],
    queryFn: () => getFlashSaleById(flashSaleId),
    enabled: open
  });
  
  const { data: allProducts = [] } = useQuery({
    queryKey: ["products"],
    queryFn: () => getProducts(),
    enabled: open
  });
  
  const addMutation = useMutation({
    mutationFn: addFlashSaleProduct,
    onSuccess: () => {
      toast.success("Product added to flash sale");
      queryClient.invalidateQueries({ queryKey: ["flash-sale", flashSaleId] });
      setSelectedProductId("");
      setSalePrice("");
      setStockLimit("");
    },
    onError: (error) => {
      toast.error("Failed to add product", { description: error.message });
    }
  });
  
  const removeMutation = useMutation({
    mutationFn: removeFlashSaleProduct,
    onSuccess: () => {
      toast.success("Product removed from flash sale");
      queryClient.invalidateQueries({ queryKey: ["flash-sale", flashSaleId] });
    },
    onError: (error) => {
      toast.error("Failed to remove product", { description: error.message });
    }
  });
  
  const handleAddProduct = () => {
    if (!selectedProductId) {
      toast.error("Please select a product");
      return;
    }
    
    addMutation.mutate({
      flash_sale_id: flashSaleId,
      product_id: selectedProductId,
      sale_price: salePrice ? parseFloat(salePrice) : undefined,
      stock_limit: stockLimit ? parseInt(stockLimit) : undefined,
    });
  };
  
  const handleRemoveProduct = (productId: string) => {
    const saleProduct = flashSale?.products.find(p => p.product_id === productId);
    if (saleProduct) {
      removeMutation.mutate(saleProduct.id);
    }
  };
  
  // Filter out products already in the flash sale
  const existingProductIds = flashSale?.products.map(p => p.product_id) || [];
  const availableProducts = allProducts.filter(p => !existingProductIds.includes(p.id));
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Flash Sale Products</DialogTitle>
          <DialogDescription>
            {flashSale?.name} - Add or remove products from this flash sale
          </DialogDescription>
        </DialogHeader>
        
        {isLoadingSale ? (
          <div className="text-center p-6">
            <div className="animate-spin h-8 w-8 border-t-2 border-primary rounded-full mx-auto"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Add Product Form */}
            <div className="border rounded-lg p-4 space-y-4">
              <h4 className="font-medium">Add Product</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="md:col-span-2">
                  <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableProducts.map(product => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} - {formatCurrency(product.price)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Input
                  type="number"
                  placeholder="Sale Price (optional)"
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Stock Limit (optional)"
                  value={stockLimit}
                  onChange={(e) => setStockLimit(e.target.value)}
                />
              </div>
              <Button 
                onClick={handleAddProduct}
                disabled={addMutation.isPending || !selectedProductId}
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </div>
            
            {/* Products List */}
            <div>
              <h4 className="font-medium mb-3">
                Products in Sale ({flashSale?.products.length || 0})
              </h4>
              
              {flashSale?.products.length === 0 ? (
                <div className="text-center p-6 border border-dashed rounded-lg">
                  <p className="text-muted-foreground">No products added yet</p>
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Original Price</TableHead>
                        <TableHead>Sale Price</TableHead>
                        <TableHead>Stock Limit</TableHead>
                        <TableHead>Sold</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {flashSale?.products.map((saleProduct: FlashSaleProduct) => (
                        <TableRow key={saleProduct.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {saleProduct.product?.image && (
                                <img 
                                  src={saleProduct.product.image}
                                  alt={saleProduct.product?.name}
                                  className="h-10 w-10 rounded object-cover"
                                />
                              )}
                              <span className="font-medium">
                                {saleProduct.product?.name || "Unknown"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {saleProduct.product 
                              ? formatCurrency(saleProduct.product.price)
                              : "-"
                            }
                          </TableCell>
                          <TableCell>
                            {saleProduct.sale_price 
                              ? formatCurrency(saleProduct.sale_price)
                              : (
                                <Badge variant="outline">
                                  {flashSale?.discount_percentage}% off
                                </Badge>
                              )
                            }
                          </TableCell>
                          <TableCell>
                            {saleProduct.stock_limit || "Unlimited"}
                          </TableCell>
                          <TableCell>
                            {saleProduct.sold_count || 0}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveProduct(saleProduct.product_id)}
                              disabled={removeMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FlashSaleProductsDialog;
