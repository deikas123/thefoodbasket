
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { submitKYCVerification } from "@/services/kycService";
import { Upload, Check, Loader2 } from "lucide-react";
import { KYCVerification } from "@/types/kyc";

interface KYCVerificationFormProps {
  kycData: KYCVerification | null;
  onVerificationSubmit: () => void;
}

const KYCVerificationForm = ({ kycData, onVerificationSubmit }: KYCVerificationFormProps) => {
  const [idDocumentFile, setIdDocumentFile] = useState<File | null>(null);
  const [addressProofFile, setAddressProofFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!idDocumentFile || !addressProofFile) {
      // Handle error - both files required
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // In a real app, we would upload files to storage here
      // For now, we'll just simulate it by using the file names
      const idDocumentUrl = `uploads/${idDocumentFile.name}`;
      const addressProofUrl = `uploads/${addressProofFile.name}`;
      
      const success = await submitKYCVerification(idDocumentUrl, addressProofUrl);
      
      if (success) {
        onVerificationSubmit();
      }
    } catch (error) {
      console.error("Error submitting KYC verification:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (kycData) {
    if (kycData.status === "approved") {
      return (
        <Card className="border-green-500">
          <CardHeader className="bg-green-50 dark:bg-green-900/20 border-b border-green-200">
            <CardTitle className="flex items-center text-green-600">
              <Check className="mr-2" />
              Verification Approved
            </CardTitle>
            <CardDescription>
              Your identity has been verified successfully. You can now use Buy Now, Pay Later.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              Verification completed on {new Date(kycData.updatedAt).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      );
    }
    
    if (kycData.status === "pending") {
      return (
        <Card>
          <CardHeader className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200">
            <CardTitle className="flex items-center text-yellow-600">
              <Loader2 className="mr-2 animate-spin" />
              Verification Pending
            </CardTitle>
            <CardDescription>
              Your verification is currently under review. This process typically takes 1-2 business days.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              Submitted on {new Date(kycData.createdAt).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      );
    }
    
    if (kycData.status === "rejected") {
      return (
        <Card>
          <CardHeader className="bg-red-50 dark:bg-red-900/20 border-b border-red-200">
            <CardTitle className="flex items-center text-red-600">
              Verification Rejected
            </CardTitle>
            <CardDescription>
              Your verification was rejected. Please review the feedback and submit again.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="font-medium mb-2">Reason:</p>
            <p className="text-sm text-muted-foreground mb-4">
              {kycData.adminNotes || "The provided documents did not meet our verification criteria."}
            </p>
            
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
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={isSubmitting || !idDocumentFile || !addressProofFile}
              >
                {isSubmitting ? (
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
            </form>
          </CardContent>
        </Card>
      );
    }
  }
  
  // Default state - no KYC yet
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
          disabled={isSubmitting || !idDocumentFile || !addressProofFile}
        >
          {isSubmitting ? (
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
