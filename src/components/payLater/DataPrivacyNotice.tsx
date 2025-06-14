
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield, Lock, Eye, FileText } from "lucide-react";

interface DataPrivacyNoticeProps {
  onAccept: () => void;
}

const DataPrivacyNotice = ({ onAccept }: DataPrivacyNoticeProps) => {
  const [accepted, setAccepted] = useState(false);

  const handleAccept = () => {
    if (accepted) {
      onAccept();
    }
  };

  return (
    <Card className="border-blue-200 bg-blue-50/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Shield className="h-5 w-5" />
          Data Privacy & Security Notice
        </CardTitle>
        <CardDescription className="text-blue-600">
          Your privacy and data security are our top priorities
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="flex items-start gap-3 p-3 bg-white rounded-lg border">
            <Lock className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-sm">Secure Storage</h4>
              <p className="text-xs text-muted-foreground">
                All documents are encrypted and stored securely using bank-grade security
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 bg-white rounded-lg border">
            <Eye className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-sm">Limited Access</h4>
              <p className="text-xs text-muted-foreground">
                Only authorized verification staff can access your documents
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 bg-white rounded-lg border">
            <FileText className="h-5 w-5 text-purple-600 mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-sm">Compliance</h4>
              <p className="text-xs text-muted-foreground">
                We comply with all data protection regulations and standards
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h4 className="font-medium mb-2">What we collect and why:</h4>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• <strong>Identity Document:</strong> To verify your identity and prevent fraud</li>
            <li>• <strong>Address Proof:</strong> To confirm your residential address for delivery</li>
            <li>• <strong>Personal Information:</strong> To assess creditworthiness for Pay Later services</li>
          </ul>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h4 className="font-medium mb-2">Your data rights:</h4>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• You can request to view your stored data at any time</li>
            <li>• You can request deletion of your data (subject to legal requirements)</li>
            <li>• Your data will never be sold or shared with third parties</li>
            <li>• Documents are automatically deleted after verification completion</li>
          </ul>
        </div>

        <div className="flex items-center space-x-2 p-4 bg-gray-50 rounded-lg">
          <Checkbox 
            id="privacy-accept"
            checked={accepted}
            onCheckedChange={setAccepted}
          />
          <label 
            htmlFor="privacy-accept" 
            className="text-sm leading-relaxed cursor-pointer"
          >
            I understand and accept the data privacy terms. I consent to the collection, 
            processing, and storage of my documents for KYC verification purposes.
          </label>
        </div>

        <Button 
          className="w-full" 
          onClick={handleAccept}
          disabled={!accepted}
        >
          I Accept - Proceed with Verification
        </Button>
      </CardContent>
    </Card>
  );
};

export default DataPrivacyNotice;
