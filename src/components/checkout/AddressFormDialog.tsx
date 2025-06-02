
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Address } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { addUserAddress, updateUserAddress } from "@/services/addressService";

interface AddressFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  address: Address | null;
  onAddressSaved?: (address: Address) => void;
}

// Kenyan Counties
const kenyaCounties = [
  "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Uasin Gishu", "Kiambu", "Machakos", 
  "Kajiado", "Nyeri", "Kilifi", "Laikipia", "Meru", "Kisii", "Kakamega", "Bungoma"
];

// Nairobi Postal Codes
const nairobiPostalCodes = [
  { code: "00100", area: "Nairobi GPO" },
  { code: "00200", area: "City Square" },
  { code: "00300", area: "Nairobi Central" },
  { code: "00400", area: "Westlands" },
  { code: "00500", area: "Ngara" },
  { code: "00600", area: "Sarit Centre" },
  { code: "00700", area: "Karen" },
  { code: "00800", area: "Buruburu" }
];

const AddressFormDialog = ({ 
  open, 
  onOpenChange, 
  address,
  onAddressSaved 
}: AddressFormDialogProps) => {
  const { user, updateProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<Omit<Address, "id">>({
    street: address?.street || "",
    city: address?.city || "",
    state: address?.state || "Nairobi",
    zipCode: address?.zipCode || "00100",
    isDefault: address?.isDefault || false
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, isDefault: checked }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("You must be logged in to save addresses");
      return;
    }
    
    if (!formData.street || !formData.city || !formData.state || !formData.zipCode) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const addressData = {
        street: formData.street,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zipCode,
        is_default: formData.isDefault
      };

      let savedAddress;
      
      if (address) {
        // Update existing address
        savedAddress = await updateUserAddress(address.id, addressData, user.id);
        toast.success("Address updated successfully");
      } else {
        // Add new address
        savedAddress = await addUserAddress(user.id, addressData);
        toast.success("Address added successfully");
      }
      
      // Convert to app format
      const formattedAddress: Address = {
        id: savedAddress.id,
        street: savedAddress.street,
        city: savedAddress.city,
        state: savedAddress.state,
        zipCode: savedAddress.zip_code,
        isDefault: savedAddress.is_default
      };
      
      // Update user context with new addresses
      const updatedAddresses = address 
        ? user.addresses.map(addr => addr.id === address.id ? formattedAddress : addr)
        : [...user.addresses, formattedAddress];
        
      await updateProfile({ addresses: updatedAddresses });
      
      // Call the callback if provided
      if (onAddressSaved) {
        onAddressSaved(formattedAddress);
      }
      
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error saving address:", error);
      toast.error(error.message || "Failed to save address");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {address ? "Edit Address" : "Add New Address"}
          </DialogTitle>
          <DialogDescription>
            Enter your delivery address details below.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="street">Street Address</Label>
            <Input
              id="street"
              name="street"
              value={formData.street}
              onChange={handleInputChange}
              placeholder="123 Moi Avenue, Apartment 4B"
              autoComplete="street-address"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City/Town</Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="Nairobi"
                autoComplete="address-level2"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="state">County</Label>
              <Select
                value={formData.state}
                onValueChange={(value) => handleSelectChange("state", value)}
              >
                <SelectTrigger id="state" className="w-full">
                  <SelectValue placeholder="Select county" />
                </SelectTrigger>
                <SelectContent>
                  {kenyaCounties.map((county) => (
                    <SelectItem key={county} value={county}>
                      {county}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="zipCode">Postal Code</Label>
            {formData.state === "Nairobi" ? (
              <Select
                value={formData.zipCode}
                onValueChange={(value) => handleSelectChange("zipCode", value)}
              >
                <SelectTrigger id="zipCode" className="w-full">
                  <SelectValue placeholder="Select postal code" />
                </SelectTrigger>
                <SelectContent>
                  {nairobiPostalCodes.map((postal) => (
                    <SelectItem key={postal.code} value={postal.code}>
                      {postal.code} - {postal.area}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                id="zipCode"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleInputChange}
                placeholder="00100"
                autoComplete="postal-code"
              />
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isDefault"
              checked={formData.isDefault}
              onCheckedChange={handleCheckboxChange}
            />
            <Label 
              htmlFor="isDefault" 
              className="text-sm font-normal cursor-pointer"
            >
              Set as default address
            </Label>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Address"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddressFormDialog;
