
import { supabase } from "@/integrations/supabase/client";
import { ProductTag } from "@/components/admin/tags/TagsManager";

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
    
    return data;
  } catch (error) {
    console.error("Error fetching tags:", error);
    return [];
  }
};

export const createTag = async (name: string): Promise<ProductTag | null> => {
  try {
    const { data, error } = await supabase
      .from('product_tags')
      .insert([{ name }])
      .select()
      .single();
    
    if (error) {
      console.error("Error creating tag:", error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error("Error creating tag:", error);
    throw error;
  }
};

export const deleteTag = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('product_tags')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error("Error deleting tag:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error deleting tag:", error);
    throw error;
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
    
    // Log the structure for debugging
    console.log("Product tags data structure:", JSON.stringify(data, null, 2));
    
    // Map the data properly based on the structure
    return data.map(item => {
      // Handle the case where product_tags might be an array or object
      if (item && item.product_tags) {
        // If it's an array, take the first element (assuming it contains our tag)
        if (Array.isArray(item.product_tags)) {
          const tag = item.product_tags[0];
          return tag ? {
            id: tag.id,
            name: tag.name,
            created_at: tag.created_at
          } as ProductTag : null;
        }
        
        // If it's an object (the expected case)
        return {
          id: item.product_tags.id,
          name: item.product_tags.name,
          created_at: item.product_tags.created_at
        } as ProductTag;
      }
      
      // Fallback in case structure is unexpected
      console.warn("Unexpected structure for product tag:", item);
      return null;
    }).filter((tag): tag is ProductTag => tag !== null); // Filter out any null values
  } catch (error) {
    console.error("Error fetching product tags:", error);
    return [];
  }
};

export const addTagToProduct = async (productId: string, tagId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('product_tag_relations')
      .insert([{ product_id: productId, tag_id: tagId }]);
    
    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        console.log("Tag already associated with product");
        return;
      }
      console.error("Error adding tag to product:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error adding tag to product:", error);
    throw error;
  }
};

export const removeTagFromProduct = async (productId: string, tagId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('product_tag_relations')
      .delete()
      .match({ product_id: productId, tag_id: tagId });
    
    if (error) {
      console.error("Error removing tag from product:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error removing tag from product:", error);
    throw error;
  }
};
