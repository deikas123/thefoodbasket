
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export const useKYCStatus = () => {
  const { user } = useAuth();
  const [kycStatus, setKycStatus] = useState<'pending' | 'approved' | 'rejected' | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    const checkKYCStatus = async () => {
      if (!user) {
        setCheckingStatus(false);
        return;
      }
      
      setCheckingStatus(true);
      try {
        console.log('Checking KYC status for user:', user.id);
        
        const { data, error } = await supabase
          .from('kyc_verifications')
          .select('status, id_document_url, address_proof_url')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error checking KYC status:', error);
          setKycStatus(null);
        } else if (data) {
          // Only set status if documents were actually submitted (both URLs must exist and not be empty)
          const hasIdDocument = data.id_document_url && data.id_document_url.trim() !== '';
          const hasAddressProof = data.address_proof_url && data.address_proof_url.trim() !== '';
          
          if (hasIdDocument && hasAddressProof) {
            console.log('Existing KYC status found with documents:', data.status);
            setKycStatus(data.status as 'pending' | 'approved' | 'rejected');
          } else {
            console.log('KYC record exists but documents are missing or empty');
            setKycStatus(null);
          }
        } else {
          console.log('No KYC record found for user');
          setKycStatus(null);
        }
      } catch (error) {
        console.error('Unexpected error checking KYC status:', error);
        setKycStatus(null);
      } finally {
        setCheckingStatus(false);
      }
    };

    checkKYCStatus();
  }, [user]);

  return { kycStatus, setKycStatus, checkingStatus };
};
