
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format, parseISO } from "date-fns";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Plus, Tag, Calendar } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { formatCurrency } from "@/utils/currencyFormatter";
import { getDailyOffers, createDailyOffer, updateDailyOffer, deleteDailyOffer, DailyOffer, OfferFormData } from "@/services/product/offerService";
import { getAllProducts } from "@/services/product/productService";
import { ProductType } from "@/types/supabase";

const DailyOffersPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [offers, setOffers] = useState<DailyOffer[]>([]);
  const [products, setProducts] = useState<ProductType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<DailyOffer | null>(null);
  const [formData, setFormData] = useState<OfferFormData>({
    product_id: "",
    discount_percentage: 10,
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    active: true
  });

  useEffect(() => {
    // Verify user is admin
    if (user?.role !== "admin") {
      navigate("/admin/login");
      return;
    }
    
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [offersData, productsData] = await Promise.all([
        getDailyOffers(),
        getAllProducts()
      ]);
      
      setOffers(offersData);
      setProducts(productsData);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (offer?: DailyOffer) => {
    if (offer) {
      setSelectedOffer(offer);
      setFormData({
        product_id: offer.product_id,
        discount_percentage: offer.discount_percentage,
        start_date: offer.start_date.split('T')[0],
        end_date: offer.end_date.split('T')[0],
        active: offer.active
      });
    } else {
      setSelectedOffer(null);
      setFormData({
        product_id: "",
        discount_percentage: 10,
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        active: true
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.product_id) {
      toast({
        title: "Validation Error",
        description: "Please select a product",
        variant: "destructive"
      });
      return;
    }

    if (formData.discount_percentage <= 0 || formData.discount_percentage > 100) {
      toast({
        title: "Validation Error",
        description: "Discount percentage must be between 1 and 100",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (selectedOffer) {
        // Update existing offer
        const updated = await updateDailyOffer(selectedOffer.id, formData);
        if (updated) {
          setOffers(offers.map(o => o.id === selectedOffer.id ? updated : o));
        }
      } else {
        // Create new offer
        const created = await createDailyOffer(formData);
        if (created) {
          setOffers([created, ...offers]);
        }
      }
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error saving offer:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this offer?")) {
      const success = await deleteDailyOffer(id);
      if (success) {
        setOffers(offers.filter(o => o.id !== id));
      }
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return dateString;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Daily Offers</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Add New Offer
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{selectedOffer ? "Edit Offer" : "Create New Offer"}</DialogTitle>
                <DialogDescription>
                  {selectedOffer ? "Update the offer details below" : "Set up a new discount offer for a product"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="product">Product</Label>
                    <Select 
                      value={formData.product_id} 
                      onValueChange={(value) => setFormData({...formData, product_id: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a product" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="discount">Discount Percentage</Label>
                    <Input
                      id="discount"
                      type="number"
                      min="1"
                      max="100"
                      value={formData.discount_percentage}
                      onChange={(e) => setFormData({...formData, discount_percentage: Number(e.target.value)})}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={formData.end_date}
                        onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="active"
                      checked={formData.active}
                      onChange={(e) => setFormData({...formData, active: e.target.checked})}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <Label htmlFor="active">Active</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : (selectedOffer ? "Update Offer" : "Create Offer")}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>All Daily Offers</CardTitle>
            <CardDescription>
              Manage special discounts for products
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <p>Loading offers...</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {offers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No offers found. Click "Add New Offer" to create one.
                      </TableCell>
                    </TableRow>
                  ) : (
                    offers.map((offer) => (
                      <TableRow key={offer.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {offer.product?.image && (
                              <img 
                                src={offer.product.image} 
                                alt={offer.product?.name} 
                                className="w-10 h-10 object-cover rounded"
                              />
                            )}
                            <span>{offer.product?.name || "Unknown Product"}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-red-100 text-red-800 border-red-200">
                            {offer.discount_percentage}% OFF
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {formatDate(offer.start_date)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {formatDate(offer.end_date)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={offer.active ? "default" : "secondary"}
                            className={offer.active ? "bg-green-100 text-green-800 border-green-200" : ""}
                          >
                            {offer.active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenDialog(offer)}
                            >
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(offer.id)}
                              className="text-destructive hover:text-destructive/90"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default DailyOffersPage;
