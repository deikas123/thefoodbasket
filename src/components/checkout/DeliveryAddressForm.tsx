
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import LocationSelector from "./LocationSelector";

interface DeliveryAddress {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  postalCode: string;
  instructions?: string;
  location?: { lat: number; lng: number; address: string };
}

interface DeliveryAddressFormProps {
  onAddressChange: (address: DeliveryAddress) => void;
  address: DeliveryAddress;
}

const DeliveryAddressForm = ({ onAddressChange, address }: DeliveryAddressFormProps) => {
  const [formData, setFormData] = useState<DeliveryAddress>(address);

  const handleInputChange = (field: keyof DeliveryAddress, value: string) => {
    const updatedData = { ...formData, [field]: value };
    setFormData(updatedData);
    onAddressChange(updatedData);
  };

  const handleLocationSelect = (location: { lat: number; lng: number; address: string }) => {
    const updatedData = { ...formData, location };
    setFormData(updatedData);
    onAddressChange(updatedData);
  };

  return (
    <div className="space-y-4">
      {/* Location Selector */}
      <LocationSelector
        onLocationSelect={handleLocationSelect}
        selectedLocation={formData.location}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="fullName" className="text-xs font-medium">Full Name *</Label>
          <Input
            id="fullName"
            value={formData.fullName}
            onChange={(e) => handleInputChange("fullName", e.target.value)}
            className="h-10 rounded-xl text-sm"
            placeholder="John Doe"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone" className="text-xs font-medium">Phone *</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            className="h-10 rounded-xl text-sm"
            placeholder="0712 345 678"
            required
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="street" className="text-xs font-medium">Street Address *</Label>
        <Input
          id="street"
          value={formData.street}
          onChange={(e) => handleInputChange("street", e.target.value)}
          className="h-10 rounded-xl text-sm"
          placeholder="123 Main Street"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="city" className="text-xs font-medium">City *</Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => handleInputChange("city", e.target.value)}
            className="h-10 rounded-xl text-sm"
            placeholder="Nairobi"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="postalCode" className="text-xs font-medium">Postal Code</Label>
          <Input
            id="postalCode"
            value={formData.postalCode}
            onChange={(e) => handleInputChange("postalCode", e.target.value)}
            className="h-10 rounded-xl text-sm"
            placeholder="00100"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="instructions" className="text-xs font-medium">Delivery Instructions</Label>
        <Textarea
          id="instructions"
          placeholder="e.g., Leave at front door, Ring bell twice"
          value={formData.instructions || ""}
          onChange={(e) => handleInputChange("instructions", e.target.value)}
          className="rounded-xl text-sm min-h-[70px]"
        />
      </div>
    </div>
  );
};

export default DeliveryAddressForm;
