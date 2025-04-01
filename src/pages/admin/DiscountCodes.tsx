
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
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

// Placeholder data until connected to database
const discountCodes = [
  {
    id: "1",
    code: "WELCOME10",
    type: "percentage",
    value: 10,
    minPurchase: 1000,
    maxDiscount: 500,
    usageLimit: 1,
    usageCount: 0,
    startDate: "2023-06-01",
    endDate: "2024-12-31",
    active: true,
  },
  {
    id: "2",
    code: "SUMMER20",
    type: "percentage",
    value: 20,
    minPurchase: 2000,
    maxDiscount: 1000,
    usageLimit: 0,
    usageCount: 45,
    startDate: "2023-06-01",
    endDate: "2023-08-31",
    active: false,
  },
  {
    id: "3",
    code: "FREE5",
    type: "fixed",
    value: 500,
    minPurchase: 0,
    maxDiscount: 0,
    usageLimit: 100,
    usageCount: 32,
    startDate: "2023-06-01", 
    endDate: "2023-12-31",
    active: true,
  },
];

const DiscountCodes = () => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<any>(null);

  const handleCreateCode = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: editingCode ? "Discount code updated" : "Discount code created",
      description: `The code ${editingCode ? "changes have" : "has"} been saved.`,
    });
    setIsDialogOpen(false);
    setEditingCode(null);
  };

  const handleDeleteCode = (id: string) => {
    toast({
      title: "Discount code deleted",
      description: "The code has been removed from the system.",
    });
  };

  const handleEditCode = (code: any) => {
    setEditingCode(code);
    setIsDialogOpen(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Discount Codes</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingCode(null)}>
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
                    defaultValue={editingCode?.code || ""}
                    className="col-span-3"
                    placeholder="e.g. SUMMER20"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="type" className="text-right">
                    Type
                  </Label>
                  <Select defaultValue={editingCode?.type || "percentage"}>
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
                    defaultValue={editingCode?.value || ""}
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
                    defaultValue={editingCode?.minPurchase || ""}
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
                    defaultValue={editingCode?.maxDiscount || ""}
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
                    defaultValue={editingCode?.usageLimit || ""}
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
                    defaultValue={editingCode?.startDate || ""}
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
                    defaultValue={editingCode?.endDate || ""}
                    className="col-span-3"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">
                  {editingCode ? "Save Changes" : "Create Code"}
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
              {discountCodes.map((code) => (
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
                    {code.minPurchase
                      ? formatCurrency(code.minPurchase)
                      : "None"}
                  </TableCell>
                  <TableCell>
                    {code.usageLimit > 0
                      ? `${code.usageCount}/${code.usageLimit}`
                      : `${code.usageCount}/∞`}
                  </TableCell>
                  <TableCell>
                    {new Date(code.endDate) < new Date()
                      ? "Expired"
                      : `Until ${new Date(code.endDate).toLocaleDateString()}`}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={code.active ? "default" : "secondary"}
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
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default DiscountCodes;
