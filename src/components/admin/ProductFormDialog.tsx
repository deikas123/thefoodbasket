
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { createProduct, updateProduct } from "@/services/product";
import { getCategories } from "@/services/product/categoryService";
import { toast } from "@/components/ui/use-toast";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ProductType } from "@/types/supabase";
import { Trash2, Upload, X } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.coerce.number().positive("Price must be positive"),
  category: z.string().min(1, "Category is required"),
  stock: z.coerce.number().int().nonnegative("Stock must be a non-negative integer"),
  featured: z.boolean().default(false),
  discount: z.coerce.number().min(0).max(100).optional(),
  // Handle images in component state instead of form state
});

type FormValues = z.infer<typeof formSchema>;

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: ProductType | null;
}

const ProductFormDialog = ({ open, onOpenChange, product }: ProductFormDialogProps) => {
  const [images, setImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  
  const queryClient = useQueryClient();
  
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories
  });
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      category: "",
      stock: 0,
      featured: false,
      discount: 0
    }
  });
  
  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        stock: product.stock,
        featured: product.featured,
        discount: product.discountPercentage || 0
      });
      
      // Set current image
      if (product.image) {
        const images = product.image.split(',').map(img => img.trim());
        setImages(images);
      } else {
        setImages([]);
      }
    } else {
      form.reset({
        name: "",
        description: "",
        price: 0,
        category: "",
        stock: 0,
        featured: false,
        discount: 0
      });
      setImages([]);
      setImageFiles([]);
    }
  }, [product, form]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setImageFiles(prev => [...prev, ...newFiles]);
      
      // Create preview URLs
      newFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImages(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };
  
  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      toast({
        title: "Product created",
        description: "The product has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create product. Please try again.",
        variant: "destructive"
      });
      console.error("Error creating product:", error);
    }
  });
  
  const updateMutation = useMutation({
    mutationFn: updateProduct,
    onSuccess: () => {
      toast({
        title: "Product updated",
        description: "The product has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update product. Please try again.",
        variant: "destructive"
      });
      console.error("Error updating product:", error);
    }
  });
  
  const onSubmit = async (values: FormValues) => {
    try {
      setIsUploading(true);
      
      // Handle image uploads here if needed
      // For this example, we'll just use the image URLs directly
      
      const productData = {
        name: values.name,
        description: values.description,
        price: values.price,
        category: values.category,
        stock: values.stock,
        featured: values.featured,
        discountPercentage: values.discount || 0,
        image: images.join(', ') // Join multiple image URLs with comma
      };
      
      if (product) {
        await updateMutation.mutateAsync({ id: product.id, ...productData });
      } else {
        await createMutation.mutateAsync(productData);
      }
      
      setIsUploading(false);
    } catch (error) {
      setIsUploading(false);
      console.error("Error submitting form:", error);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? "Edit Product" : "Add New Product"}</DialogTitle>
          <DialogDescription>
            {product 
              ? "Update the product details below."
              : "Fill out the form below to add a new product."}
          </DialogDescription>
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
                    <FormLabel>Price (KSh)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
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
                        placeholder="0"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
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
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories?.map(category => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
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
                name="discount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number" 
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
                    <p className="text-sm text-muted-foreground">
                      Featured products appear on the homepage.
                    </p>
                  </div>
                </FormItem>
              )}
            />
            
            {/* Image Upload */}
            <div>
              <FormLabel>Product Images</FormLabel>
              <div className="flex flex-wrap gap-2 my-2">
                {images.map((img, index) => (
                  <div key={index} className="relative w-20 h-20 border rounded-md overflow-hidden group">
                    <img 
                      src={img} 
                      alt={`Product image ${index}`} 
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                
                <label className="w-20 h-20 border border-dashed rounded-md flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
                  <Upload className="h-6 w-6 text-gray-400" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                    multiple
                  />
                </label>
              </div>
              <p className="text-sm text-muted-foreground">
                Upload one or more product images. First image will be used as the main product image.
              </p>
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending || isUploading}>
                {isUploading 
                  ? "Uploading..." 
                  : createMutation.isPending || updateMutation.isPending 
                    ? "Saving..." 
                    : product ? "Update Product" : "Add Product"
                }
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductFormDialog;
