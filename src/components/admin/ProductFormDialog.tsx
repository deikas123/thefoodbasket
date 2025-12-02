
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProductType } from "@/types/supabase";
import { Loader2 } from "lucide-react";
import ImageUploadField from "./ImageUploadField";
import MultipleImageUpload from "./MultipleImageUpload";
import ProductBasicFields from "./product/ProductBasicFields";
import ProductPriceStockFields from "./product/ProductPriceStockFields";
import ProductUnitField from "./product/ProductUnitField";
import ProductCategoryField from "./product/ProductCategoryField";
import ProductStoreField from "./product/ProductStoreField";
import ProductDiscountFeaturedFields from "./product/ProductDiscountFeaturedFields";
import ProductTagsField from "./product/ProductTagsField";
import { useProductFormSubmit } from "./product/useProductFormSubmit";
import { productSchema, ProductFormValues } from "@/types/productForm";
import { getCategories } from "@/services/product/categoryService";

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
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { getAllTags } from "@/services/product/tagService";

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: ProductType | null;
}

const ProductFormDialog = ({ open, onOpenChange, product }: ProductFormDialogProps) => {
  // Fetch categories using the service function
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories
  });

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

  // Fetch existing additional images for this product
  const { data: productImages, refetch: refetchImages } = useQuery({
    queryKey: ["product-images", product?.id],
    queryFn: async () => {
      if (!product?.id) return [];
      
      const { data, error } = await supabase
        .from('product_images')
        .select('image_url')
        .eq('product_id', product.id);
      
      if (error) {
        console.error("Error fetching product images:", error);
        return [];
      }
      
      return data.map(item => item.image_url);
    },
    enabled: !!product?.id
  });

  // Fetch stores
  const { data: stores, isLoading: storesLoading } = useQuery({
    queryKey: ["stores"],
    queryFn: async () => {
      const { data, error } = await supabase.from('stores').select('id, name').eq('active', true);
      if (error) throw error;
      return data;
    }
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
      store_id: "none",
      unit: 'piece',
      brand_name: "",
      weight: "",
    },
  });

  // Form submission hook
  const { onSubmit, isSubmitting } = useProductFormSubmit({ product, onOpenChange });

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
        store_id: product.store_id || "none",
        unit: (product.unit as any) || 'piece',
        brand_name: product.brand_name || "",
        weight: product.weight || "",
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
        store_id: "none",
        unit: 'piece',
        brand_name: "",
        weight: "",
      });
    }
  }, [product, form, productTags]);

  console.log("Categories data:", categories);
  console.log("Categories loading:", categoriesLoading);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? "Edit Product" : "Add New Product"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <ProductBasicFields form={form} />
            <ProductPriceStockFields form={form} />
            <ProductUnitField form={form} />

            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <ImageUploadField
                      label="Product Image"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <ProductCategoryField 
              form={form} 
              categories={categories} 
              isLoading={categoriesLoading}
            />
            <ProductStoreField 
              form={form} 
              stores={stores} 
              isLoading={storesLoading}
            />
            <ProductDiscountFeaturedFields form={form} />
            <ProductTagsField form={form} availableTags={availableTags} />

            {/* Multiple Images Upload */}
            {product?.id && (
              <MultipleImageUpload 
                productId={product.id} 
                existingImages={productImages}
                onImagesChange={() => refetchImages()}
              />
            )}

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isSubmitting ? "Saving..." : product ? "Update" : "Create"} Product
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductFormDialog;
