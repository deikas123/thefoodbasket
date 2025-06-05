
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Delivery Address</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Location Selector */}
          <LocationSelector
            onLocationSelect={handleLocationSelect}
            selectedLocation={formData.location}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="street">Street Address *</Label>
            <Input
              id="street"
              value={formData.street}
              onChange={(e) => handleInputChange("street", e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input
                id="postalCode"
                value={formData.postalCode}
                onChange={(e) => handleInputChange("postalCode", e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="instructions">Delivery Instructions (Optional)</Label>
            <Textarea
              id="instructions"
              placeholder="e.g., Leave at front door, Ring bell twice"
              value={formData.instructions || ""}
              onChange={(e) => handleInputChange("instructions", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeliveryAddressForm;
