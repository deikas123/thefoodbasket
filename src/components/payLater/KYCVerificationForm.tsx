
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Loader2 } from "lucide-react";

interface KYCVerificationFormProps {
  onSubmit: (formData: any) => Promise<void>;
  isLoading: boolean;
}

const KYCVerificationForm = ({ onSubmit, isLoading }: KYCVerificationFormProps) => {
  const [idDocumentFile, setIdDocumentFile] = useState<File | null>(null);
  const [addressProofFile, setAddressProofFile] = useState<File | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!idDocumentFile || !addressProofFile) {
      console.error('Missing required files');
      return;
    }
    
    console.log('Submitting KYC form with files:', {
      idDocument: idDocumentFile.name,
      addressProof: addressProofFile.name
    });
    
    // Create form data with file URLs (in real app, you'd upload to storage first)
    const formData = {
      idDocumentUrl: `uploads/${idDocumentFile.name}`,
      addressProofUrl: `uploads/${addressProofFile.name}`
    };
    
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('KYC submission failed:', error);
    }
  };
  
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
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button 
          type="submit" 
          onClick={handleSubmit}
          disabled={isLoading || !idDocumentFile || !addressProofFile}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
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
