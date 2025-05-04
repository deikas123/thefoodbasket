
import { supabase } from "@/integrations/supabase/client";
import { WebsiteSection } from "@/types/content";
import { toast } from "sonner";

// Get all website sections
export const getWebsiteSections = async (): Promise<WebsiteSection[]> => {
  try {
    const { data, error } = await supabase
      .from('website_sections')
      .select('*')
      .order('position', { ascending: true });
      
    if (error) throw error;
    return data || [];
  } catch (error: any) {
    console.error("Error fetching website sections:", error.message);
    return [];
  }
};

// Update a website section
export const updateWebsiteSection = async (id: string, updates: Partial<WebsiteSection>): Promise<WebsiteSection | null> => {
  try {
    const { data, error } = await supabase
      .from('website_sections')
      .update({
        ...updates,
        updatedAt: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    
    toast.success("Section updated successfully");
    return data;
  } catch (error: any) {
    toast.error(`Error updating section: ${error.message}`);
    return null;
  }
};

// Upload an image
export const uploadSectionImage = async (file: File, path: string): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${path}/${Date.now()}.${fileExt}`;

    const { error: uploadError, data } = await supabase.storage
      .from('website_content')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('website_content')
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (error: any) {
    toast.error(`Error uploading image: ${error.message}`);
    return null;
  }
};

// Delete an image
export const deleteImage = async (path: string): Promise<boolean> => {
  try {
    // Extract file path from public URL
    const fileName = path.split('/').pop();
    if (!fileName) throw new Error("Invalid file path");

    const { error } = await supabase.storage
      .from('website_content')
      .remove([`images/${fileName}`]);

    if (error) throw error;
    
    return true;
  } catch (error: any) {
    toast.error(`Error deleting image: ${error.message}`);
    return false;
  }
};
