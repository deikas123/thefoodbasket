
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

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
  free_delivery_threshold?: number;
  express_delivery_available?: boolean;
  max_delivery_distance?: number;
  default_delivery_time?: number;
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

  const handleGeneralSettingChange = (field: keyof DeliverySettings, value: any) => {
    console.log(`${field} changed to:`, value);
    onSettingsChange({
      ...settings,
      [field]: value
    });
  };

  return (
    <div className="space-y-8">
      {/* Basic Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Basic Delivery Settings</h3>
        
        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="min-checkout">Minimum Checkout Amount (KSH)</Label>
            <Input
              id="min-checkout"
              type="number"
              step="0.01"
              value={settings.minimum_checkout_amount}
              onChange={(e) => handleMinimumCheckoutChange(parseFloat(e.target.value) || 0)}
            />
            <p className="text-xs text-muted-foreground">
              Minimum order value required for checkout
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="free-delivery">Free Delivery Threshold (KSH)</Label>
            <Input
              id="free-delivery"
              type="number"
              step="0.01"
              value={settings.free_delivery_threshold || 0}
              onChange={(e) => handleGeneralSettingChange('free_delivery_threshold', parseFloat(e.target.value) || 0)}
            />
            <p className="text-xs text-muted-foreground">
              Order value above which delivery is free
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="max-distance">Maximum Delivery Distance (KM)</Label>
            <Input
              id="max-distance"
              type="number"
              step="0.1"
              value={settings.max_delivery_distance || 0}
              onChange={(e) => handleGeneralSettingChange('max_delivery_distance', parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="default-time">Default Delivery Time (Hours)</Label>
            <Input
              id="default-time"
              type="number"
              step="0.5"
              value={settings.default_delivery_time || 24}
              onChange={(e) => handleGeneralSettingChange('default_delivery_time', parseFloat(e.target.value) || 24)}
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="express-delivery"
            checked={settings.express_delivery_available || false}
            onCheckedChange={(checked) => handleGeneralSettingChange('express_delivery_available', checked)}
          />
          <Label htmlFor="express-delivery">Enable Express Delivery Option</Label>
        </div>
      </div>

      <Separator />

      {/* Warehouse Location */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Warehouse Location</h3>
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
        <p className="text-xs text-muted-foreground">
          Used for calculating delivery distances and routes
        </p>
      </div>

      <Separator />

      {/* Scheduled Delivery Settings */}
      <div className="space-y-4">
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
