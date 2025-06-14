
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Loader2 } from "lucide-react";
import { uploadKYCDocument } from "@/services/fileUploadService";
import { useAuth } from "@/context/AuthContext";

interface KYCVerificationFormProps {
  onSubmit: (formData: any) => Promise<void>;
  isLoading: boolean;
}

const KYCVerificationForm = ({ onSubmit, isLoading }: KYCVerificationFormProps) => {
  const { user } = useAuth();
  const [idDocumentFile, setIdDocumentFile] = useState<File | null>(null);
  const [addressProofFile, setAddressProofFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!idDocumentFile || !addressProofFile || !user) {
      console.error('Missing required files or user not authenticated');
      return;
    }
    
    console.log('Submitting KYC form with files:', {
      idDocument: idDocumentFile.name,
      addressProof: addressProofFile.name,
      userId: user.id
    });
    
    setUploading(true);
    
    try {
      // Upload files and get URLs
      const [idDocumentUrl, addressProofUrl] = await Promise.all([
        uploadKYCDocument(idDocumentFile, user.id, 'id'),
        uploadKYCDocument(addressProofFile, user.id, 'address')
      ]);
      
      console.log('Files uploaded:', { idDocumentUrl, addressProofUrl });
      
      const formData = {
        idDocumentUrl,
        addressProofUrl
      };
      
      await onSubmit(formData);
    } catch (error) {
      console.error('KYC submission failed:', error);
    } finally {
      setUploading(false);
    }
  };
  
  const isSubmitDisabled = isLoading || uploading || !idDocumentFile || !addressProofFile;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Identity Verification</CardTitle>
        <CardDescription>
          To use Buy Now, Pay Later feature, we need to verify your identity. Please upload the required documents.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="id-document">ID Document (Passport, Driver's License, ID Card)</Label>
            <Input 
              id="id-document"
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setIdDocumentFile(e.target.files?.[0] || null)}
              required
            />
            {idDocumentFile && (
              <p className="text-sm text-green-600">Selected: {idDocumentFile.name}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address-proof">Proof of Address (Utility Bill, Bank Statement)</Label>
            <Input 
              id="address-proof"
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setAddressProofFile(e.target.files?.[0] || null)}
              required
            />
            {addressProofFile && (
              <p className="text-sm text-green-600">Selected: {addressProofFile.name}</p>
            )}
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button 
          type="submit" 
          onClick={handleSubmit}
          disabled={isSubmitDisabled}
        >
          {isLoading || uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {uploading ? 'Uploading...' : 'Submitting...'}
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Submit for Verification
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default KYCVerificationForm;
