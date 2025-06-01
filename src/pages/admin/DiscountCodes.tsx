import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  getDiscountCodes, 
  createDiscountCode, 
  updateDiscountCode, 
  deleteDiscountCode,
  DiscountCode,
  DiscountCodeFormData
} from "@/services/discountService";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Edit } from "lucide-react";
import { formatCurrency } from "@/utils/currencyFormatter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import AdminLayout from "@/layouts/AdminLayout";

const DiscountCodes = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [discountCodes, setDiscountCodes] = useState<DiscountCode[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<DiscountCode | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<DiscountCodeFormData>({
    code: "",
    type: "percentage",
    value: 10,
    min_purchase: 0,
    max_discount: 0,
    usage_limit: 0,
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    active: true,
    description: ""
  });

  useEffect(() => {
    // Verify user is admin
    if (user?.role !== "admin") {
      navigate("/admin/login");
      return;
    }
    
    fetchDiscountCodes();
  }, [user, navigate]);

  const fetchDiscountCodes = async () => {
    setIsLoading(true);
    try {
      const data = await getDiscountCodes();
      setDiscountCodes(data);
    } catch (error) {
      console.error("Error fetching discount codes:", error);
      toast({
        title: "Error",
        description: "Failed to load discount codes",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (editingCode) {
        // Update existing code
        const updated = await updateDiscountCode(editingCode.id, formData);
        if (updated) {
          setDiscountCodes(
            discountCodes.map(code => code.id === editingCode.id ? updated : code)
          );
          setIsDialogOpen(false);
          resetForm();
        }
      } else {
        // Create new code
        const newCode = await createDiscountCode(formData);
        if (newCode) {
          setDiscountCodes([newCode, ...discountCodes]);
          setIsDialogOpen(false);
          resetForm();
        }
      }
    } catch (error) {
      console.error("Error saving discount code:", error);
      toast({
        title: "Error",
        description: "Failed to save discount code",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCode = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this discount code?")) {
      const success = await deleteDiscountCode(id);
      if (success) {
        setDiscountCodes(discountCodes.filter(code => code.id !== id));
      }
    }
  };

  const handleEditCode = (code: DiscountCode) => {
    setEditingCode(code);
    setFormData({
      code: code.code,
      type: code.type,
      value: code.value,
      min_purchase: code.min_purchase,
      max_discount: code.max_discount,
      usage_limit: code.usage_limit,
      start_date: code.start_date.split('T')[0],
      end_date: code.end_date.split('T')[0],
      active: code.active,
      description: code.description || ""
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingCode(null);
    setFormData({
      code: "",
      type: "percentage",
      value: 10,
      min_purchase: 0,
      max_discount: 0,
      usage_limit: 0,
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      active: true,
      description: ""
    });
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Discount Codes</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                resetForm();
                setIsDialogOpen(true);
              }}>
                <Plus className="mr-2 h-4 w-4" /> Create Code
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>
                  {editingCode ? "Edit Discount Code" : "Create Discount Code"}
                </DialogTitle>
                <DialogDescription>
                  {editingCode
                    ? "Make changes to the existing discount code"
                    : "Create a new discount code for your customers"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateCode}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="code" className="text-right">
                      Code
                    </Label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      className="col-span-3"
                      placeholder="e.g. SUMMER20"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="type" className="text-right">
                      Type
                    </Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: 'percentage' | 'fixed') => setFormData({ ...formData, type: value })}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage</SelectItem>
                        <SelectItem value="fixed">Fixed Amount</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="value" className="text-right">
                      Value
                    </Label>
                    <Input
                      id="value"
                      type="number"
                      min="0"
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                      className="col-span-3"
                      placeholder="10"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="minPurchase" className="text-right">
                      Min Purchase
                    </Label>
                    <Input
                      id="minPurchase"
                      type="number"
                      min="0"
                      value={formData.min_purchase || ""}
                      onChange={(e) => setFormData({ ...formData, min_purchase: e.target.value ? Number(e.target.value) : null })}
                      className="col-span-3"
                      placeholder="1000"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="maxDiscount" className="text-right">
                      Max Discount
                    </Label>
                    <Input
                      id="maxDiscount"
                      type="number"
                      min="0"
                      value={formData.max_discount || ""}
                      onChange={(e) => setFormData({ ...formData, max_discount: e.target.value ? Number(e.target.value) : null })}
                      className="col-span-3"
                      placeholder="500"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="usageLimit" className="text-right">
                      Usage Limit
                    </Label>
                    <Input
                      id="usageLimit"
                      type="number"
                      min="0"
                      value={formData.usage_limit || ""}
                      onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value ? Number(e.target.value) : null })}
                      className="col-span-3"
                      placeholder="0 for unlimited"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="startDate" className="text-right">
                      Start Date
                    </Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="endDate" className="text-right">
                      End Date
                    </Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="active" className="text-right">
                      Status
                    </Label>
                    <div className="col-span-3 flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="active"
                        checked={formData.active}
                        onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <Label htmlFor="active" className="m-0">Active</Label>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">
                      Description
                    </Label>
                    <Input
                      id="description"
                      value={formData.description || ""}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="col-span-3"
                      placeholder="Optional description"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : (editingCode ? "Save Changes" : "Create Code")}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Discount Codes</CardTitle>
            <CardDescription>
              Manage promotional codes for your store
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <p>Loading discount codes...</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Min Purchase</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Validity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {discountCodes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                        No discount codes found. Click "Create Code" to add one.
                      </TableCell>
                    </TableRow>
                  ) : (
                    discountCodes.map((code) => (
                      <TableRow key={code.id}>
                        <TableCell className="font-medium">{code.code}</TableCell>
                        <TableCell>
                          {code.type === "percentage" ? "Percentage" : "Fixed Amount"}
                        </TableCell>
                        <TableCell>
                          {code.type === "percentage"
                            ? `${code.value}%`
                            : formatCurrency(code.value)}
                        </TableCell>
                        <TableCell>
                          {code.min_purchase
                            ? formatCurrency(code.min_purchase)
                            : "None"}
                        </TableCell>
                        <TableCell>
                          {code.usage_limit > 0
                            ? `${code.usage_count}/${code.usage_limit}`
                            : `${code.usage_count}/∞`}
                        </TableCell>
                        <TableCell>
                          {new Date(code.end_date) < new Date()
                            ? "Expired"
                            : `Until ${new Date(code.end_date).toLocaleDateString()}`}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={code.active ? "default" : "secondary"}
                            className={code.active ? "bg-green-100 text-green-800 border-green-200" : ""}
                          >
                            {code.active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditCode(code)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteCode(code.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
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

export default DiscountCodes;
