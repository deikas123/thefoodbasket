import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Smartphone } from "lucide-react";

interface MpesaPaymentFormProps {
  onSubmit: (phoneNumber: string) => void;
  isProcessing: boolean;
}

export const MpesaPaymentForm = ({ onSubmit, isProcessing }: MpesaPaymentFormProps) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState("");

  const validatePhoneNumber = (phone: string): boolean => {
    // Remove spaces and validate format
    const cleaned = phone.replace(/\s+/g, '');
    
    // Check for valid Kenyan phone number formats
    const validFormats = [
      /^0[17]\d{8}$/,        // 0712345678 or 0112345678
      /^254[17]\d{8}$/,      // 254712345678 or 254112345678
      /^\+254[17]\d{8}$/,    // +254712345678 or +254112345678
    ];

    return validFormats.some(format => format.test(cleaned));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!phoneNumber) {
      setError("Phone number is required");
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      setError("Please enter a valid Kenyan M-Pesa phone number");
      return;
    }

    onSubmit(phoneNumber);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <div className="space-y-2">
        <Label htmlFor="mpesa-phone" className="flex items-center gap-2">
          <Smartphone className="h-4 w-4" />
          M-Pesa Phone Number
        </Label>
        <Input
          id="mpesa-phone"
          type="tel"
          placeholder="0712345678 or 254712345678"
          value={phoneNumber}
          onChange={(e) => {
            setPhoneNumber(e.target.value);
            setError("");
          }}
          disabled={isProcessing}
          className={error ? "border-destructive" : ""}
        />
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
        <p className="text-sm text-muted-foreground">
          You will receive a payment prompt on your phone
        </p>
      </div>
      
      <Button
        type="submit"
        className="w-full"
        disabled={isProcessing}
      >
        {isProcessing ? "Processing..." : "Pay with M-Pesa"}
      </Button>
    </form>
  );
};
