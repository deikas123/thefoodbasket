
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Address } from "@/types";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { PlusCircle, Home, Edit } from "lucide-react";
import AddressFormDialog from "./AddressFormDialog";

interface DeliveryAddressFormProps {
  selectedAddress: Address | null;
  setSelectedAddress: (address: Address) => void;
}

const DeliveryAddressForm = ({ 
  selectedAddress, 
  setSelectedAddress 
}: DeliveryAddressFormProps) => {
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  
  const addresses = user?.addresses || [];
  
  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setIsDialogOpen(true);
  };
  
  const handleAddNewAddress = () => {
    setEditingAddress(null);
    setIsDialogOpen(true);
  };

  const handleAddressSaved = (address: Address) => {
    // Auto-select the newly saved address
    setSelectedAddress(address);
  };
  
  return (
    <div>
      {addresses.length > 0 ? (
        <RadioGroup 
          value={selectedAddress?.id} 
          onValueChange={(value) => {
            const address = addresses.find(addr => addr.id === value);
            if (address) setSelectedAddress(address);
          }}
          className="space-y-3"
        >
          {addresses.map((address) => (
            <div
              key={address.id}
              className="flex items-start space-x-2 border rounded-lg p-4 transition-colors hover:bg-accent/50"
            >
              <RadioGroupItem value={address.id} id={address.id} className="mt-1" />
              <div className="flex-1">
                <Label 
                  htmlFor={address.id}
                  className="flex items-start cursor-pointer"
                >
                  <div className="flex-1">
                    <div className="flex items-center">
                      {address.isDefault && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full mr-2">
                          Default
                        </span>
                      )}
                      <span className="font-medium">{user?.firstName} {user?.lastName}</span>
                    </div>
                    
                    <div className="mt-1 text-muted-foreground text-sm">
                      {address.street}, {address.city}<br />
                      {address.state}, {address.zipCode}
                    </div>
                  </div>
                </Label>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2"
                  onClick={() => handleEditAddress(address)}
                >
                  <Edit className="mr-1 h-3 w-3" />
                  Edit
                </Button>
              </div>
            </div>
          ))}
        </RadioGroup>
      ) : (
        <div className="text-center p-6 border rounded-lg">
          <Home className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
          <h3 className="font-medium">No addresses saved</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Add a new address to continue with checkout
          </p>
        </div>
      )}
      
      <Button
        variant="outline"
        onClick={handleAddNewAddress}
        className="mt-4"
      >
        <PlusCircle className="mr-2 h-4 w-4" />
        Add New Address
      </Button>
      
      <AddressFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        address={editingAddress}
        onAddressSaved={handleAddressSaved}
      />
    </div>
  );
};

export default DeliveryAddressForm;
