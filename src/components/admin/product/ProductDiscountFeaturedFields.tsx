
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { UseFormReturn } from "react-hook-form";

interface ProductFormValues {
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  featured: boolean;
  discountPercentage?: number;
  tags: string[];
}

interface ProductDiscountFeaturedFieldsProps {
  form: UseFormReturn<ProductFormValues>;
}

const ProductDiscountFeaturedFields = ({ form }: ProductDiscountFeaturedFieldsProps) => {
  return (
    <>
      <FormField
        control={form.control}
        name="discountPercentage"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Discount Percentage</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                min="0" 
                max="100"
                placeholder="0" 
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="featured"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>Featured Product</FormLabel>
            </div>
          </FormItem>
        )}
      />
    </>
  );
};

export default ProductDiscountFeaturedFields;
