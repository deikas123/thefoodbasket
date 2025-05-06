
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProductType } from "@/types/supabase";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { getAllTags } from "@/services/product/tagService";
import { Badge } from "@/components/ui/badge";

const productSchema = z.object({
  name: z.string().min(2, { message: "Name is required" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  price: z.coerce.number().positive({ message: "Price must be positive" }),
  image: z.string().min(1, { message: "Image URL is required" }),
  category: z.string().min(1, { message: "Category is required" }),
  stock: z.coerce.number().int().nonnegative({ message: "Stock must be a non-negative integer" }),
  featured: z.boolean().default(false),
  discountPercentage: z.coerce.number().min(0).max(100).optional(),
  tags: z.array(z.string()).default([]),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: ProductType | null;
}

const categories = [
  "fruits", "vegetables", "dairy", "bakery", "meat", "seafood", 
  "snacks", "beverages", "frozen", "canned", "dry goods", "household"
];

const ProductFormDialog = ({ open, onOpenChange, product }: ProductFormDialogProps) => {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch all available tags
  const { data: availableTags } = useQuery({
    queryKey: ["product-tags"],
    queryFn: getAllTags
  });

  // Fetch existing tags for this product if editing
  const { data: productTags } = useQuery({
    queryKey: ["product-tags", product?.id],
    queryFn: async () => {
      if (!product?.id) return [];
      
      const { data, error } = await supabase
        .from('product_tag_relations')
        .select('tag_id, product_tags(*)')
        .eq('product_id', product.id);
      
      if (error) {
        console.error("Error fetching product tags:", error);
        return [];
      }
      
      return data.map(item => item.tag_id);
    },
    enabled: !!product?.id
  });

  // Form setup
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      image: "",
      category: "",
      stock: 0,
      featured: false,
      discountPercentage: 0,
      tags: [],
    },
  });

  // Update form values when product changes
  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        description: product.description,
        price: product.price,
        image: product.image,
        category: product.category,
        stock: product.stock,
        featured: product.featured,
        discountPercentage: product.discountPercentage || 0,
        tags: productTags || [],
      });
    } else {
      form.reset({
        name: "",
        description: "",
        price: 0,
        image: "",
        category: "",
        stock: 0,
        featured: false,
        discountPercentage: 0,
        tags: [],
      });
    }
  }, [product, form, productTags]);

  // Handle form submission
  const onSubmit = async (values: ProductFormValues) => {
    setIsSubmitting(true);
    try {
      if (product) {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update({
            name: values.name,
            description: values.description,
            price: values.price,
            image: values.image,
            category: values.category,
            stock: values.stock,
            featured: values.featured,
            discountPercentage: values.discountPercentage || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', product.id);

        if (error) throw error;
        
        // Update product tags
        // First delete all existing relations
        await supabase
          .from('product_tag_relations')
          .delete()
          .eq('product_id', product.id);
        
        // Then insert new relations if any tags selected
        if (values.tags.length > 0) {
          const tagRelations = values.tags.map(tagId => ({
            product_id: product.id,
            tag_id: tagId
          }));
          
          const { error: tagError } = await supabase
            .from('product_tag_relations')
            .insert(tagRelations);
            
          if (tagError) console.error("Error updating product tags:", tagError);
        }
        
        toast("Product updated successfully");
      } else {
        // Create new product
        const { data, error } = await supabase
          .from('products')
          .insert({
            name: values.name,
            description: values.description,
            price: values.price,
            image: values.image,
            category: values.category,
            stock: values.stock,
            featured: values.featured,
            discountPercentage: values.discountPercentage || null,
            rating: 0,
            num_reviews: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) throw error;
        
        // Add product tags if any selected
        if (values.tags.length > 0) {
          const tagRelations = values.tags.map(tagId => ({
            product_id: data.id,
            tag_id: tagId
          }));
          
          const { error: tagError } = await supabase
            .from('product_tag_relations')
            .insert(tagRelations);
            
          if (tagError) console.error("Error adding product tags:", tagError);
        }
        
        toast("Product created successfully");
      }

      // Invalidate queries to refresh product data
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      
      // Close dialog
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error saving product:", error);
      toast("Failed to save product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleTag = (tagId: string) => {
    const currentTags = form.getValues("tags");
    const updatedTags = currentTags.includes(tagId)
      ? currentTags.filter(id => id !== tagId)
      : [...currentTags, tagId];
    
    form.setValue("tags", updatedTags);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? "Edit Product" : "Add New Product"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter product name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter product description" 
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        step="0.01"
                        placeholder="0.00" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        placeholder="0" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter image URL" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

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

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {product ? "Update" : "Create"} Product
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductFormDialog;
