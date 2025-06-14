
import { supabase } from "@/integrations/supabase/client";

export const uploadKYCDocument = async (file: File, userId: string, documentType: 'id' | 'address'): Promise<string> => {
  console.log('Uploading KYC document:', { fileName: file.name, userId, documentType });
  
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${documentType}-${Date.now()}.${fileExt}`;
  
  // For now, we'll create a mock URL since storage isn't set up
  // In a real implementation, you'd upload to Supabase Storage
  const mockUrl = `https://example.com/kyc-documents/${fileName}`;
  
  console.log('Mock URL created:', mockUrl);
  return mockUrl;
};
