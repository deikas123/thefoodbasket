import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Edit, Eye, Mail, Plus, Trash2, Zap } from "lucide-react";
import { toast } from "sonner";
import { 
  getFlashSales,
  getFlashSaleById,
  createFlashSale,
  updateFlashSale,
  deleteFlashSale,
  FlashSale,
  FlashSaleFormData
} from "@/services/flashSaleService";
import { sendFlashSaleNotification } from "@/services/flashSaleNotificationService";
import FlashSaleFormDialog from "@/components/admin/flashSales/FlashSaleFormDialog";
import FlashSaleProductsDialog from "@/components/admin/flashSales/FlashSaleProductsDialog";

const FlashSalesPage = () => {
  const queryClient = useQueryClient();
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [showProductsDialog, setShowProductsDialog] = useState(false);
  const [editingSale, setEditingSale] = useState<FlashSale | null>(null);
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);
  
  const { data: flashSales = [], isLoading } = useQuery({
    queryKey: ["flash-sales"],
    queryFn: getFlashSales
  });
  
  const createMutation = useMutation({
    mutationFn: createFlashSale,
    onSuccess: () => {
      toast.success("Flash sale created successfully");
      queryClient.invalidateQueries({ queryKey: ["flash-sales"] });
      setShowFormDialog(false);
    },
    onError: (error) => {
      toast.error("Failed to create flash sale", { description: error.message });
    }
  });
  
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<FlashSaleFormData> }) => 
      updateFlashSale(id, data),
    onSuccess: () => {
      toast.success("Flash sale updated successfully");
      queryClient.invalidateQueries({ queryKey: ["flash-sales"] });
      setShowFormDialog(false);
      setEditingSale(null);
    },
    onError: (error) => {
      toast.error("Failed to update flash sale", { description: error.message });
    }
  });
  
  const deleteMutation = useMutation({
    mutationFn: deleteFlashSale,
    onSuccess: () => {
      toast.success("Flash sale deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["flash-sales"] });
    },
    onError: (error) => {
      toast.error("Failed to delete flash sale", { description: error.message });
    }
  });
  
  const handleCreate = (data: FlashSaleFormData) => {
    createMutation.mutate(data);
  };
  
  const handleUpdate = (data: FlashSaleFormData) => {
    if (editingSale) {
      updateMutation.mutate({ id: editingSale.id, data });
    }
  };
  
  const handleAddNew = () => {
    setEditingSale(null);
    setShowFormDialog(true);
  };
  
  const handleEdit = (sale: FlashSale) => {
    setEditingSale(sale);
    setShowFormDialog(true);
  };
  
  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this flash sale?")) {
      deleteMutation.mutate(id);
    }
  };
  
  const handleSendNotification = async (sale: FlashSale) => {
    const confirmed = confirm(
      `Send email notification to all customers about "${sale.name}"?\n\nThis will email all users who have opted in for promotional emails.`
    );
    
    if (!confirmed) return;
    
    try {
      toast.loading("Sending notifications...", { id: "flash-notification" });
      
      // Get product count
      const saleWithProducts = await getFlashSaleById(sale.id);
      const productCount = saleWithProducts?.products.length || 0;
      
      const result = await sendFlashSaleNotification({
        flashSaleId: sale.id,
        flashSaleName: sale.name,
        discountPercentage: sale.discount_percentage,
        endDate: sale.end_date,
        productCount,
      });
      
      if (result.success) {
        toast.success(
          `Notifications sent successfully!`,
          { 
            id: "flash-notification",
            description: `Sent to ${result.successCount} of ${result.totalRecipients} recipients`
          }
        );
      } else {
        toast.error("Failed to send notifications", { 
          id: "flash-notification",
          description: result.error 
        });
      }
    } catch (error: any) {
      toast.error("Failed to send notifications", { 
        id: "flash-notification",
        description: error.message 
      });
    }
  };
  
  const handleManageProducts = (saleId: string) => {
    setSelectedSaleId(saleId);
    setShowProductsDialog(true);
  };
  
  const getSaleStatus = (sale: FlashSale) => {
    const now = new Date();
    const startDate = new Date(sale.start_date);
    const endDate = new Date(sale.end_date);
    
    if (!sale.active) return { label: "Inactive", variant: "outline" as const };
    if (now < startDate) return { label: "Upcoming", variant: "secondary" as const };
    if (now > endDate) return { label: "Expired", variant: "outline" as const };
    return { label: "Active", variant: "default" as const };
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Zap className="h-8 w-8 text-yellow-500" />
          <h1 className="text-3xl font-bold tracking-tight">Flash Sales</h1>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="mr-2 h-4 w-4" />
          Create Flash Sale
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Manage Flash Sales</CardTitle>
          <CardDescription>
            Create time-limited flash sales with special discounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center p-6">
              <div className="animate-spin h-8 w-8 border-t-2 border-primary rounded-full mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">Loading flash sales...</p>
            </div>
          ) : flashSales.length === 0 ? (
            <div className="text-center p-8 border border-dashed rounded-lg">
              <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No flash sales found. Create your first flash sale!</p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {flashSales.map((sale) => {
                    const status = getSaleStatus(sale);
                    return (
                      <TableRow key={sale.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: sale.banner_color || '#ef4444' }}
                            />
                            <div>
                              <div className="font-medium">{sale.name}</div>
                              {sale.description && (
                                <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                                  {sale.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                            {sale.discount_percentage}% OFF
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>From: {new Date(sale.start_date).toLocaleString()}</div>
                            <div>To: {new Date(sale.end_date).toLocaleString()}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleManageProducts(sale.id)}
                              title="Manage Products"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleSendNotification(sale)}
                              title="Send Email Notification"
                              disabled={status.label !== "Active"}
                            >
                              <Mail className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleEdit(sale)}
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleDelete(sale.id)}
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      <FlashSaleFormDialog
        open={showFormDialog}
        onOpenChange={setShowFormDialog}
        sale={editingSale}
        onSubmit={editingSale ? handleUpdate : handleCreate}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />
      
      {selectedSaleId && (
        <FlashSaleProductsDialog
          open={showProductsDialog}
          onOpenChange={setShowProductsDialog}
          flashSaleId={selectedSaleId}
        />
      )}
    </div>
  );
};

export default FlashSalesPage;
