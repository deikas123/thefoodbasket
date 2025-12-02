import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { ProductFormValues } from "@/types/productForm";
import { Skeleton } from "@/components/ui/skeleton";

interface Store {
  id: string;
  name: string;
}

interface ProductStoreFieldProps {
  form: UseFormReturn<ProductFormValues>;
  stores?: Store[];
  isLoading?: boolean;
}

const ProductStoreField = ({ form, stores, isLoading }: ProductStoreFieldProps) => {
  if (isLoading) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium">Store</label>
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <FormField
      control={form.control}
      name="store_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Store (Optional)</FormLabel>
          <Select 
            onValueChange={(value) => field.onChange(value === "none" ? "" : value)} 
            defaultValue={field.value || "none"}
            value={field.value || "none"}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select a store (optional)" />
              </SelectTrigger>
            </FormControl>
            <SelectContent className="bg-background z-50">
              <SelectItem value="none">All Stores</SelectItem>
              {stores && stores.length > 0 && stores.map((store) => (
                <SelectItem key={store.id} value={store.id}>
                  {store.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default ProductStoreField;
