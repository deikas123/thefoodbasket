import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Store, deleteStore } from "@/services/storeService";
import StoreFormDialog from "./StoreFormDialog";
import { toast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface StoresTableProps {
  stores: Store[];
  onUpdate: () => void;
}

const StoresTable = ({ stores, onUpdate }: StoresTableProps) => {
  const handleDelete = async (id: string) => {
    try {
      await deleteStore(id);
      toast({
        title: "Store deleted",
        description: "The store has been deleted successfully.",
      });
      onUpdate();
    } catch (error) {
      console.error("Error deleting store:", error);
      toast({
        title: "Error",
        description: "Failed to delete store. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Logo</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Address</TableHead>
          <TableHead>Contact</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {stores.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
              No stores found. Create your first store to get started.
            </TableCell>
          </TableRow>
        ) : (
          stores.map((store) => (
            <TableRow key={store.id}>
              <TableCell>
                {store.logo ? (
                  <img src={store.logo} alt={store.name} className="h-10 w-10 rounded object-cover" />
                ) : (
                  <div className="h-10 w-10 rounded bg-muted flex items-center justify-center text-muted-foreground">
                    {store.name.charAt(0)}
                  </div>
                )}
              </TableCell>
              <TableCell className="font-medium">{store.name}</TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {store.address || "—"}
              </TableCell>
              <TableCell className="text-sm">
                {store.phone && <div>{store.phone}</div>}
                {store.email && <div className="text-muted-foreground">{store.email}</div>}
                {!store.phone && !store.email && "—"}
              </TableCell>
              <TableCell>
                <Badge variant={store.active ? "default" : "secondary"}>
                  {store.active ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <StoreFormDialog store={store} onSuccess={onUpdate} />
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Store</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this store? This action cannot be undone and will also delete all associated products, categories, and offers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(store.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default StoresTable;
