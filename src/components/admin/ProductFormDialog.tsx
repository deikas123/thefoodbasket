import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProductType } from "@/types/supabase";
import { toast } from "sonner";
import { Loader2, Upload, Image, X, Plus } from "lucide-react";
import { uploadProductImage, uploadProductImages } from "@/services/storageService";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { getAllTags } from "@/services/product/tagService";
import { Badge } from "@/components/ui/badge";

const productSchema = z.object({
  name: z.string().min(2, { message: "Name is required" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  price: z.coerce.number().positive({ message: "Price must be positive" }),
  image: z.string().min(1, { message: "Image URL is required" }),
  additionalImages: z.array(z.string()).optional(),
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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [additionalImageFiles, setAdditionalImageFiles] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const additionalFileInputRef = useRef<HTMLInputElement>(null);

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

  // Get additional images if editing
  const { data: additionalImages } = useQuery({
    queryKey: ["product-additional-images", product?.id],
    queryFn: async () => {
      if (!product?.id) return [];
      
      const { data, error } = await supabase
        .from('product_images')
        .select('image_url')
        .eq('product_id', product.id);
      
      if (error) {
        console.error("Error fetching additional images:", error);
        return [];
      }
      
      return data ? data.map(item => item.image_url) : [];
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
      additionalImages: [],
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
        additionalImages: additionalImages || [],
        category: product.category,
        stock: product.stock,
        featured: product.featured,
        discountPercentage: product.discountPercentage || 0,
        tags: productTags || [],
      });
      setImagePreview(product.image);
      setAdditionalImagePreviews(additionalImages || []);
    } else {
      form.reset({
        name: "",
        description: "",
        price: 0,
        image: "",
        additionalImages: [],
        category: "",
        stock: 0,
        featured: false,
        discountPercentage: 0,
        tags: [],
      });
      setImagePreview(null);
      setImageFile(null);
      setAdditionalImageFiles([]);
      setAdditionalImagePreviews([]);
    }
  }, [product, form, productTags, additionalImages]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    
    // Auto-set the form value
    form.setValue("image", "uploaded-image-pending");
  };

  const handleAdditionalImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;
    
    const newFiles = Array.from(selectedFiles);
    setAdditionalImageFiles(prev => [...prev, ...newFiles]);
    
    // Create previews
    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAdditionalImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
    
    // Update form value
    const currentAdditionalImages = form.getValues("additionalImages") || [];
    form.setValue("additionalImages", [
      ...currentAdditionalImages,
      ...Array(newFiles.length).fill("uploaded-image-pending")
    ]);
  };

  const removeAdditionalImage = (index: number) => {
    // Remove from previews
    setAdditionalImagePreviews(prev => prev.filter((_, i) => i !== index));
    
    // Remove from files if it's a new upload
    if (index < additionalImageFiles.length) {
      setAdditionalImageFiles(prev => prev.filter((_, i) => i !== index));
    }
    
    // Remove from form values
    const currentImages = form.getValues("additionalImages") || [];
    form.setValue("additionalImages", currentImages.filter((_, i) => i !== index));
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const triggerAdditionalFileInput = () => {
    additionalFileInputRef.current?.click();
  };

  // Handle form submission
  const onSubmit = async (values: ProductFormValues) => {
    setIsSubmitting(true);
    try {
      // Upload main image if there's a new file
      let imageUrl = values.image;
      if (imageFile) {
        console.log("Uploading main image file:", imageFile.name);
        const uploadedUrl = await uploadProductImage(imageFile);
        if (uploadedUrl) {
          console.log("Image uploaded successfully:", uploadedUrl);
          imageUrl = uploadedUrl;
        } else {
          // If upload failed and we don't have an existing image
          if (!product?.image) {
            toast.error("Main image upload failed");
            setIsSubmitting(false);
            return;
          }
        }
      } else if (!values.image && !product?.image) {
        toast.error("Please upload a product image");
        setIsSubmitting(false);
        return;
      }
      
      // Upload additional images
      let additionalImageUrls: string[] = [];
      if (additionalImageFiles.length > 0) {
        const uploadedUrls = await uploadProductImages(additionalImageFiles);
        additionalImageUrls = uploadedUrls;
        if (additionalImageUrls.length !== additionalImageFiles.length) {
          toast.warning("Some additional images failed to upload");
        }
      }
      
      // Combine with existing additional images
      if (values.additionalImages) {
        additionalImageUrls = [
          ...values.additionalImages.filter(url => url !== "uploaded-image-pending"),
          ...additionalImageUrls
        ];
      }
      
      // First, get the category_id from the category slug
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', values.category)
        .single();
      
      if (categoryError || !categoryData) {
        console.error("Error finding category:", categoryError || "Category not found");
        toast.error("Error: Category not found");
        setIsSubmitting(false);
        return;
      }
      
      if (product) {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update({
            name: values.name,
            description: values.description,
            price: values.price,
            image: imageUrl,
            category_id: categoryData.id,
            stock: values.stock,
            featured: values.featured,
            discount_percentage: values.discountPercentage || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', product.id);

        if (error) {
          console.error("Error updating product:", error);
          toast.error("Failed to update product");
          setIsSubmitting(false);
          return;
        }
        
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
            
          if (tagError) {
            console.error("Error updating product tags:", tagError);
            toast.error("Failed to update product tags");
          }
        }
        
        // First delete existing additional images
        await supabase
          .from('product_images')
          .delete()
          .eq('product_id', product.id);
          
        // Then insert new ones
        if (additionalImageUrls.length > 0) {
          const imageRecords = additionalImageUrls.map(url => ({
            product_id: product.id,
            image_url: url
          }));
          
          const { error: imagesError } = await supabase
            .from('product_images')
            .insert(imageRecords);
            
          if (imagesError) {
            console.error("Error updating additional images:", imagesError);
            toast.error("Failed to update additional images");
          }
        }
        
        toast.success("Product updated successfully");
      } else {
        // Create new product
        const { data, error } = await supabase
          .from('products')
          .insert({
            name: values.name,
            description: values.description,
            price: values.price,
            image: imageUrl,
            category_id: categoryData.id,
            stock: values.stock,
            featured: values.featured,
            discount_percentage: values.discountPercentage || null,
            rating: 0,
            num_reviews: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) {
          console.error("Error creating product:", error);
          toast.error("Failed to create product");
          setIsSubmitting(false);
          return;
        }
        
        // Add product tags if any selected
        if (values.tags.length > 0) {
          const tagRelations = values.tags.map(tagId => ({
            product_id: data.id,
            tag_id: tagId
          }));
          
          const { error: tagError } = await supabase
            .from('product_tag_relations')
            .insert(tagRelations);
            
          if (tagError) {
            console.error("Error adding product tags:", tagError);
            toast.error("Failed to add product tags");
          }
        }
        
        // Add additional images
        if (additionalImageUrls.length > 0) {
          const imageRecords = additionalImageUrls.map(url => ({
            product_id: data.id,
            image_url: url
          }));
          
          const { error: imagesError } = await supabase
            .from('product_images')
            .insert(imageRecords);
            
          if (imagesError) {
            console.error("Error adding additional images:", imagesError);
            toast.error("Failed to add additional images");
          }
        }
        
        toast.success("Product created successfully");
      }

      // Invalidate queries to refresh product data
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      
      // Close dialog
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error saving product:", error);
      toast.error("Failed to save product: " + (error.message || "Unknown error"));
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
                  <FormLabel>Main Product Image</FormLabel>
                  <div className="space-y-2">
                    {/* Hidden file input */}
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleImageChange} 
                    />
                    
                    {/* Image preview */}
                    {imagePreview && (
                      <div className="relative w-32 h-32 rounded-md overflow-hidden border mb-2">
                        <img 
                          src={imagePreview} 
                          alt="Product preview" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    {/* Upload button */}
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={triggerFileInput} 
                      className="flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4" /> 
                      {imagePreview ? 'Change Image' : 'Upload Image'}
                    </Button>
                    
                    {/* Hidden input for form validation */}
                    <Input 
                      type="hidden" 
                      {...field}
                      value={imagePreview ? field.value || "uploaded-image" : ""} 
                    />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="additionalImages"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Images</FormLabel>
                  <div className="space-y-2">
                    {/* Hidden file input */}
                    <input 
                      type="file" 
                      multiple
                      ref={additionalFileInputRef} 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleAdditionalImagesChange} 
                    />
                    
                    {/* Images preview */}
                    {additionalImagePreviews.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {additionalImagePreviews.map((preview, index) => (
                          <div key={index} className="relative w-24 h-24 rounded-md overflow-hidden border">
                            <img 
                              src={preview} 
                              alt={`Additional image ${index + 1}`} 
                              className="w-full h-full object-cover"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-0 right-0 h-6 w-6 rounded-full"
                              onClick={() => removeAdditionalImage(index)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Upload button */}
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={triggerAdditionalFileInput} 
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" /> 
                      Add More Images
                    </Button>
                    
                    {/* Hidden input for form validation */}
                    <Input type="hidden" {...field} />
                  </div>
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
