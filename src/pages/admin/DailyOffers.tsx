
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
import { Edit, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/utils/currencyFormatter";
import { 
  getDailyOffers, 
  createDailyOffer,
  updateDailyOffer, 
  deleteDailyOffer,
  DailyOffer,
  OfferFormData
} from "@/services/product/offerService";
import { getProducts } from "@/services/product";
import DailyOfferFormDialog from "@/components/admin/offers/DailyOfferFormDialog";

const DailyOffersPage = () => {
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [editingOffer, setEditingOffer] = useState<DailyOffer | null>(null);
  
  // Fetch offers and products
  const { data: offers = [], isLoading: isLoadingOffers } = useQuery({
    queryKey: ["daily-offers"],
    queryFn: getDailyOffers
  });
  
  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts
  });
  
  // Create offer mutation
  const createMutation = useMutation({
    mutationFn: createDailyOffer,
    onSuccess: () => {
      toast.success("Daily offer created successfully");
      queryClient.invalidateQueries({ queryKey: ["daily-offers"] });
      setShowDialog(false);
    },
    onError: (error) => {
      toast.error("Failed to create offer", { 
        description: error.message 
      });
    }
  });
  
  // Update offer mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<OfferFormData> }) => 
      updateDailyOffer(id, data),
    onSuccess: () => {
      toast.success("Daily offer updated successfully");
      queryClient.invalidateQueries({ queryKey: ["daily-offers"] });
      setShowDialog(false);
      setEditingOffer(null);
    },
    onError: (error) => {
      toast.error("Failed to update offer", { 
        description: error.message 
      });
    }
  });
  
  // Delete offer mutation
  const deleteMutation = useMutation({
    mutationFn: deleteDailyOffer,
    onSuccess: () => {
      toast.success("Daily offer deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["daily-offers"] });
    },
    onError: (error) => {
      toast.error("Failed to delete offer", { 
        description: error.message 
      });
    }
  });
  
  const handleCreateOffer = (data: OfferFormData) => {
    createMutation.mutate(data);
  };
  
  const handleUpdateOffer = (data: OfferFormData) => {
    if (editingOffer) {
      updateMutation.mutate({ id: editingOffer.id, data });
    }
  };
  
  const handleAddNew = () => {
    setEditingOffer(null);
    setShowDialog(true);
  };
  
  const handleEdit = (offer: DailyOffer) => {
    setEditingOffer(offer);
    setShowDialog(true);
  };
  
  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this offer?")) {
      deleteMutation.mutate(id);
    }
  };
  
  const isOfferActive = (offer: DailyOffer) => {
    const now = new Date();
    const startDate = new Date(offer.start_date);
    const endDate = new Date(offer.end_date);
    return offer.active && now >= startDate && now <= endDate;
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Daily Offers</h1>
        <Button onClick={handleAddNew}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Offer
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Manage Daily Offers</CardTitle>
          <CardDescription>
            Create and manage special daily discounts for products
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingOffers ? (
            <div className="text-center p-6">
              <div className="animate-spin h-8 w-8 border-t-2 border-primary rounded-full mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">Loading offers...</p>
            </div>
          ) : offers.length === 0 ? (
            <div className="text-center p-8 border border-dashed rounded-lg">
              <p className="text-muted-foreground">No daily offers found. Create your first offer!</p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {offers.map((offer) => {
                    const isActive = isOfferActive(offer);
                    return (
                      <TableRow key={offer.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {offer.product?.image && (
                              <img 
                                src={offer.product.image} 
                                alt={offer.product?.name} 
                                className="h-10 w-10 rounded-md object-cover"
                              />
                            )}
                            <div>
                              <div className="font-medium">
                                {offer.product?.name || "Unknown Product"}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {offer.product ? formatCurrency(offer.product.price) : "-"}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            {offer.discount_percentage}% OFF
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>From: {new Date(offer.start_date).toLocaleDateString()}</div>
                            <div>To: {new Date(offer.end_date).toLocaleDateString()}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {isActive ? (
                            <Badge className="bg-green-500">Active</Badge>
                          ) : !offer.active ? (
                            <Badge variant="outline" className="text-muted-foreground">Inactive</Badge>
                          ) : new Date() < new Date(offer.start_date) ? (
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700">Upcoming</Badge>
                          ) : (
                            <Badge variant="outline" className="bg-gray-100 text-gray-500">Expired</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleEdit(offer)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleDelete(offer.id)}
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
      
      <DailyOfferFormDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        offer={editingOffer}
        products={products}
        onSubmit={editingOffer ? handleUpdateOffer : handleCreateOffer}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
};

export default DailyOffersPage;
