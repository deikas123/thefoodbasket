
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const uploadProductImage = async (file: File): Promise<string | null> => {
  try {
    console.log("Starting image upload process...");
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return null;
    }
    
    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return null;
    }
    
    // Generate a unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `product-images/${fileName}`;
    
    console.log("Uploading file:", fileName, "Size:", file.size);
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('products')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      console.error("Error uploading image:", error);
      toast.error(`Failed to upload image: ${error.message}`);
      return null;
    }
    
    console.log("Upload successful:", data?.path);
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('products')
      .getPublicUrl(filePath);
    
    console.log("Generated public URL:", publicUrl);
    
    if (!publicUrl) {
      console.error("Failed to generate public URL");
      toast.error("Failed to generate image URL");
      return null;
    }
    
    toast.success("Image uploaded successfully!");
    return publicUrl;
    
  } catch (error) {
    console.error("Error in image upload:", error);
    toast.error("An error occurred while uploading the image");
    return null;
  }
};

export const uploadProductImages = async (files: File[]): Promise<string[]> => {
  console.log(`Uploading ${files.length} additional images...`);
  const uploadPromises = files.map(file => uploadProductImage(file));
  const results = await Promise.all(uploadPromises);
  const successfulUploads = results.filter((url): url is string => url !== null);
  
  if (successfulUploads.length !== files.length) {
    toast.warning(`${files.length - successfulUploads.length} images failed to upload`);
  }
  
  return successfulUploads;
};

export const deleteProductImage = async (imageUrl: string): Promise<boolean> => {
  try {
    if (!imageUrl.includes('/products/')) {
      console.warn("Not a products bucket URL:", imageUrl);
      return false;
    }
    
    // Extract file path from URL
    const url = new URL(imageUrl);
    const pathSegments = url.pathname.split('/');
    const objectIndex = pathSegments.indexOf('object');
    
    if (objectIndex === -1) {
      console.error("Invalid storage URL format:", imageUrl);
      return false;
    }
    
    const filePath = pathSegments.slice(objectIndex + 3).join('/');
    console.log("Deleting file:", filePath);
    
    const { error } = await supabase.storage
      .from('products')
      .remove([filePath]);
    
    if (error) {
      console.error("Error deleting image:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in image deletion:", error);
    return false;
  }
};
