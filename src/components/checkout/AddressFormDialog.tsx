
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
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AddressFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  address: Address | null;
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
  address 
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
    
    if (!user) return;
    
    if (!formData.street || !formData.city || !formData.state || !formData.zipCode) {
      toast({
        title: "Please fill in all fields",
        description: "All address fields are required.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // If making this address default, update all other addresses
      if (formData.isDefault) {
        await supabase
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', user.id);
      }
      
      if (address) {
        // Update existing address
        await supabase
          .from('addresses')
          .update({
            street: formData.street,
            city: formData.city,
            state: formData.state,
            zip_code: formData.zipCode,
            is_default: formData.isDefault
          })
          .eq('id', address.id);
      } else {
        // Add new address
        await supabase
          .from('addresses')
          .insert({
            user_id: user.id,
            street: formData.street,
            city: formData.city,
            state: formData.state,
            zip_code: formData.zipCode,
            is_default: formData.isDefault || user.addresses.length === 0 // Make default if first address
          });
      }
      
      // Fetch updated addresses to refresh UI
      const { data: addresses } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id);
        
      if (addresses) {
        // Convert from database format to app format
        const formattedAddresses = addresses.map(addr => ({
          id: addr.id,
          street: addr.street,
          city: addr.city,
          state: addr.state,
          zipCode: addr.zip_code,
          isDefault: addr.is_default
        }));
        
        // Update the user context with new addresses
        await updateProfile({ addresses: formattedAddresses });
      }
      
      toast({
        title: address ? "Address updated" : "Address added",
        description: address 
          ? "Your address has been updated successfully." 
          : "Your address has been added successfully."
      });
      
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save the address. Please try again.",
        variant: "destructive"
      });
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
