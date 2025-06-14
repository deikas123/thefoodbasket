
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductType } from "@/types/supabase";
import { toast } from "sonner";

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

interface UseProductFormSubmitProps {
  product: ProductType | null;
  onOpenChange: (open: boolean) => void;
}

export const useProductFormSubmit = ({ product, onOpenChange }: UseProductFormSubmitProps) => {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (values: ProductFormValues) => {
    setIsSubmitting(true);
    try {
      console.log("Starting form submission...");
      
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
            image: values.image,
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
        await supabase
          .from('product_tag_relations')
          .delete()
          .eq('product_id', product.id);
        
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
        
        toast.success("Product updated successfully");
      } else {
        // Create new product
        const { data, error } = await supabase
          .from('products')
          .insert({
            name: values.name,
            description: values.description,
            price: values.price,
            image: values.image,
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

  return {
    onSubmit,
    isSubmitting
  };
};
