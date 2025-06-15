
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DeliverySettings {
  minimum_checkout_amount: number;
  warehouse_location: {
    lat: number;
    lng: number;
  };
  scheduled_delivery: {
    pricing_type: 'free' | 'fixed' | 'percentage';
    fixed_price?: number;
    percentage_of_subtotal?: number;
    min_days_advance?: number;
  };
}

interface DeliverySettingsFormProps {
  settings: DeliverySettings;
  onSettingsChange: (settings: DeliverySettings) => void;
}

const DeliverySettingsForm: React.FC<DeliverySettingsFormProps> = ({
  settings,
  onSettingsChange
}) => {
  const handleMinimumCheckoutChange = (value: number) => {
    console.log("Minimum checkout amount changed to:", value);
    onSettingsChange({
      ...settings,
      minimum_checkout_amount: value
    });
  };

  const handleWarehouseLocationChange = (field: 'lat' | 'lng', value: number) => {
    console.log(`Warehouse ${field} changed to:`, value);
    onSettingsChange({
      ...settings,
      warehouse_location: {
        ...settings.warehouse_location,
        [field]: value
      }
    });
  };

  const handleScheduledDeliveryChange = (field: string, value: any) => {
    console.log(`Scheduled delivery ${field} changed to:`, value);
    onSettingsChange({
      ...settings,
      scheduled_delivery: {
        ...settings.scheduled_delivery,
        [field]: value
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-2">
        <Label htmlFor="min-checkout">Minimum Checkout Amount (KSH)</Label>
        <Input
          id="min-checkout"
          type="number"
          step="0.01"
          value={settings.minimum_checkout_amount}
          onChange={(e) => handleMinimumCheckoutChange(parseFloat(e.target.value) || 0)}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="warehouse-lat">Warehouse Latitude</Label>
          <Input
            id="warehouse-lat"
            type="number"
            step="0.000001"
            value={settings.warehouse_location.lat}
            onChange={(e) => handleWarehouseLocationChange('lat', parseFloat(e.target.value) || 0)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="warehouse-lng">Warehouse Longitude</Label>
          <Input
            id="warehouse-lng"
            type="number"
            step="0.000001"
            value={settings.warehouse_location.lng}
            onChange={(e) => handleWarehouseLocationChange('lng', parseFloat(e.target.value) || 0)}
          />
        </div>
      </div>

      <div className="space-y-4 border-t pt-4">
        <h3 className="text-lg font-semibold">Scheduled Delivery Pricing</h3>
        
        <div className="grid gap-2">
          <Label htmlFor="pricing-type">Pricing Type</Label>
          <Select 
            value={settings.scheduled_delivery.pricing_type} 
            onValueChange={(value: 'free' | 'fixed' | 'percentage') => 
              handleScheduledDeliveryChange('pricing_type', value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select pricing type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="free">Free</SelectItem>
              <SelectItem value="fixed">Fixed Price</SelectItem>
              <SelectItem value="percentage">Percentage of Subtotal</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {settings.scheduled_delivery.pricing_type === 'fixed' && (
          <div className="grid gap-2">
            <Label htmlFor="fixed-price">Fixed Price (KSH)</Label>
            <Input
              id="fixed-price"
              type="number"
              step="0.01"
              value={settings.scheduled_delivery.fixed_price || 0}
              onChange={(e) => handleScheduledDeliveryChange('fixed_price', parseFloat(e.target.value) || 0)}
            />
          </div>
        )}

        {settings.scheduled_delivery.pricing_type === 'percentage' && (
          <div className="grid gap-2">
            <Label htmlFor="percentage">Percentage of Subtotal (%)</Label>
            <Input
              id="percentage"
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={settings.scheduled_delivery.percentage_of_subtotal || 0}
              onChange={(e) => handleScheduledDeliveryChange('percentage_of_subtotal', parseFloat(e.target.value) || 0)}
            />
          </div>
        )}

        <div className="grid gap-2">
          <Label htmlFor="min-days">Minimum Days in Advance</Label>
          <Input
            id="min-days"
            type="number"
            min="0"
            value={settings.scheduled_delivery.min_days_advance || 1}
            onChange={(e) => handleScheduledDeliveryChange('min_days_advance', parseInt(e.target.value) || 1)}
          />
        </div>
      </div>
    </div>
  );
};

export default DeliverySettingsForm;
