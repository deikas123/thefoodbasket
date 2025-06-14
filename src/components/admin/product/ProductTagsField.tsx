
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
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

interface Tag {
  id: string;
  name: string;
}

interface ProductTagsFieldProps {
  form: UseFormReturn<ProductFormValues>;
  availableTags?: Tag[];
}

const ProductTagsField = ({ form, availableTags }: ProductTagsFieldProps) => {
  const toggleTag = (tagId: string) => {
    const currentTags = form.getValues("tags");
    const updatedTags = currentTags.includes(tagId)
      ? currentTags.filter(id => id !== tagId)
      : [...currentTags, tagId];
    
    form.setValue("tags", updatedTags);
  };

  return (
    <FormField
      control={form.control}
      name="tags"
      render={() => (
        <FormItem>
          <FormLabel>Product Tags</FormLabel>
          <div className="border rounded-md p-3">
            <div className="flex flex-wrap gap-2">
              {availableTags?.map(tag => {
                const isSelected = form.getValues("tags").includes(tag.id);
                return (
                  <Badge
                    key={tag.id}
                    variant={isSelected ? "default" : "outline"}
                    className={`cursor-pointer ${isSelected ? 'bg-primary' : ''}`}
                    onClick={() => toggleTag(tag.id)}
                  >
                    {tag.name}
                  </Badge>
                );
              })}
              
              {(!availableTags || availableTags.length === 0) && (
                <p className="text-sm text-muted-foreground">No tags available. Create tags in the Tags management section.</p>
              )}
            </div>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default ProductTagsField;
