
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

// Homepage Mode Types
export type HomepageMode = 'home' | 'waitlist' | 'maintenance' | 'promo';

// Get Homepage Mode
export const getHomepageMode = async (): Promise<HomepageMode> => {
  try {
    const { data, error } = await supabase
      .from('website_sections')
      .select('settings')
      .eq('type', 'homepage_mode')
      .eq('name', 'homepage_mode')
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    
    return data?.settings?.mode ?? 'home';
  } catch (error: any) {
    console.error('Failed to get homepage mode:', error);
    return 'home';
  }
};

export const setHomepageMode = async (mode: HomepageMode): Promise<boolean> => {
  try {
    const { data: existing, error: selectError } = await supabase
      .from('website_sections')
      .select('id')
      .eq('type', 'homepage_mode')
      .eq('name', 'homepage_mode')
      .maybeSingle();

    if (selectError) throw selectError;

    if (existing) {
      const { error } = await supabase
        .from('website_sections')
        .update({ 
          settings: { mode },
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id);

      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('website_sections')
        .insert({
          name: 'homepage_mode',
          type: 'homepage_mode',
          title: 'Homepage Mode',
          settings: { mode },
          position: 0,
          active: true
        });

      if (error) throw error;
    }

    const modeLabels: Record<HomepageMode, string> = {
      home: 'Normal Homepage',
      waitlist: 'Waitlist Page',
      maintenance: 'Maintenance Page',
      promo: 'Promotional Page'
    };
    
    toast.success(`Switched to ${modeLabels[mode]}`);
    return true;
  } catch (error: any) {
    console.error('Failed to update homepage mode:', error);
    toast.error(`Failed to update homepage mode: ${error.message}`);
    return false;
  }
};

// Legacy support - maps to new system
export const getWaitlistMode = async (): Promise<boolean> => {
  const mode = await getHomepageMode();
  return mode === 'waitlist';
};

export const setWaitlistMode = async (enabled: boolean): Promise<boolean> => {
  return setHomepageMode(enabled ? 'waitlist' : 'home');
};
