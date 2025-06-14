
import { supabase } from "@/integrations/supabase/client";

export const uploadKYCDocument = async (file: File, userId: string, documentType: 'id' | 'address'): Promise<string> => {
  console.log('Uploading KYC document:', { fileName: file.name, userId, documentType });
  
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${documentType}-${Date.now()}.${fileExt}`;
    
    console.log('Uploading to storage path:', fileName);
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('kyc-documents')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      console.error('Storage upload error:', error);
      if (error.message.includes('not found') || error.message.includes('bucket')) {
        throw new Error(`Storage bucket 'kyc-documents' not found. Please contact support.`);
      }
      throw new Error(`Failed to upload file: ${error.message}`);
    }
    
    console.log('File uploaded successfully:', data.path);
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('kyc-documents')
      .getPublicUrl(fileName);
    
    console.log('Generated public URL:', publicUrl);
    return publicUrl;
    
  } catch (error) {
    console.error('Error uploading KYC document:', error);
    throw error;
  }
};
