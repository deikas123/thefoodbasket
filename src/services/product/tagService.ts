
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ProductTag {
  id: string;
  name: string;
  createdAt: string;
}

export const createTag = async (name: string): Promise<ProductTag | null> => {
  try {
    const { data, error } = await supabase
      .from('product_tags')
      .insert([{ name }])
      .select()
      .single();
    
    if (error) {
      console.error("Error creating tag:", error);
      toast.error("Failed to create tag");
      return null;
    }
    
    return {
      id: data.id,
      name: data.name,
      createdAt: data.created_at
    };
  } catch (error) {
    console.error("Error in createTag:", error);
    toast.error("An error occurred while creating the tag");
    return null;
  }
};

export const updateTag = async (id: string, name: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('product_tags')
      .update({ name })
      .eq('id', id);
    
    if (error) {
      console.error("Error updating tag:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in updateTag:", error);
    return false;
  }
};

export const deleteTag = async (id: string): Promise<boolean> => {
  try {
    // First delete all relations to this tag
    const { error: relationError } = await supabase
      .from('product_tag_relations')
      .delete()
      .eq('tag_id', id);
    
    if (relationError) {
      console.error("Error deleting tag relations:", relationError);
      return false;
    }
    
    // Then delete the tag itself
    const { error } = await supabase
      .from('product_tags')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error("Error deleting tag:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in deleteTag:", error);
    return false;
  }
};

export const getAllTags = async (): Promise<ProductTag[]> => {
  try {
    const { data, error } = await supabase
      .from('product_tags')
      .select('*')
      .order('name');
    
    if (error) {
      console.error("Error fetching tags:", error);
      return [];
    }
    
    if (!data || data.length === 0) {
      return [];
    }
    
    return data.map(tag => ({
      id: tag.id,
      name: tag.name,
      createdAt: tag.created_at
    }));
  } catch (error) {
    console.error("Error in getAllTags:", error);
    return [];
  }
};

export const getProductTags = async (productId: string): Promise<ProductTag[]> => {
  try {
    const { data, error } = await supabase
      .from('product_tag_relations')
      .select('tag_id, product_tags(*)')
      .eq('product_id', productId);
    
    if (error) {
      console.error("Error fetching product tags:", error);
      return [];
    }
    
    if (!data || data.length === 0) {
      return [];
    }

    // Debug log to see what structure we're getting
    console.log("Tag data from supabase:", data);
    
    return data
      .filter(item => item.product_tags !== null)
      .map(item => {
        // Type-safe access to properties
        const tagData = item.product_tags;
        
        if (!tagData) {
          return null;
        }
        
        return {
          id: tagData.id,
          name: tagData.name,
          createdAt: tagData.created_at
        };
      })
      .filter((tag): tag is ProductTag => tag !== null);
  } catch (error) {
    console.error("Error in getProductTags:", error);
    return [];
  }
};
