
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { ProductFormValues } from "@/types/productForm";
import { Skeleton } from "@/components/ui/skeleton";

interface Category {
  id: string;
  name: string;
  productCount?: number;
}

interface ProductCategoryFieldProps {
  form: UseFormReturn<ProductFormValues>;
  categories?: Category[];
  isLoading?: boolean;
}

const ProductCategoryField = ({ form, categories, isLoading }: ProductCategoryFieldProps) => {
  console.log("ProductCategoryField - categories:", categories);
  console.log("ProductCategoryField - isLoading:", isLoading);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium">Category</label>
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <FormField
      control={form.control}
      name="category"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Category</FormLabel>
          <Select 
            onValueChange={field.onChange} 
            defaultValue={field.value}
            value={field.value}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
            </FormControl>
            <SelectContent className="bg-background z-50">
              {categories && categories.length > 0 ? (
                categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))
              ) : (
                <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                  No categories available
                </div>
              )}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default ProductCategoryField;
