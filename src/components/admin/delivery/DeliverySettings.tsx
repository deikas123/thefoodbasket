
import React from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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

const DeliverySettings = () => {
  const [settings, setSettings] = React.useState<DeliverySettings>({
    minimum_checkout_amount: 1500, // Updated to KSH equivalent
    warehouse_location: { lat: -1.2921, lng: 36.8219 }, // Nairobi default
    scheduled_delivery: {
      pricing_type: 'free',
      min_days_advance: 1
    }
  });

  const queryClient = useQueryClient();

  const { data: deliverySettings } = useQuery({
    queryKey: ["delivery-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('website_sections')
        .select('settings')
        .eq('type', 'delivery_settings')
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data?.settings || settings;
    }
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: DeliverySettings) => {
      const { error } = await supabase
        .from('website_sections')
        .upsert({
          name: 'delivery_settings',
          type: 'delivery_settings',
          title: 'Delivery Settings',
          settings: newSettings
        }, { onConflict: 'type' });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["delivery-settings"] });
      toast.success("Settings updated successfully");
    }
  });

  const handleSettingsUpdate = () => {
    updateSettingsMutation.mutate(settings);
  };

  React.useEffect(() => {
    if (deliverySettings) {
      setSettings(deliverySettings);
    }
  }, [deliverySettings]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Settings className="mr-2 h-5 w-5" />
          Delivery Settings
        </CardTitle>
        <CardDescription>
          Configure global delivery settings and policies
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-2">
          <Label htmlFor="min-checkout">Minimum Checkout Amount (KSH)</Label>
          <Input
            id="min-checkout"
            type="number"
            step="0.01"
            value={settings.minimum_checkout_amount}
            onChange={(e) => setSettings(prev => ({ 
              ...prev, 
              minimum_checkout_amount: parseFloat(e.target.value) || 0 
            }))}
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
              onChange={(e) => setSettings(prev => ({ 
                ...prev, 
                warehouse_location: {
                  ...prev.warehouse_location,
                  lat: parseFloat(e.target.value) || 0
                }
              }))}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="warehouse-lng">Warehouse Longitude</Label>
            <Input
              id="warehouse-lng"
              type="number"
              step="0.000001"
              value={settings.warehouse_location.lng}
              onChange={(e) => setSettings(prev => ({ 
                ...prev, 
                warehouse_location: {
                  ...prev.warehouse_location,
                  lng: parseFloat(e.target.value) || 0
                }
              }))}
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
                setSettings(prev => ({ 
                  ...prev, 
                  scheduled_delivery: {
                    ...prev.scheduled_delivery,
                    pricing_type: value
                  }
                }))
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
                onChange={(e) => setSettings(prev => ({ 
                  ...prev, 
                  scheduled_delivery: {
                    ...prev.scheduled_delivery,
                    fixed_price: parseFloat(e.target.value) || 0
                  }
                }))}
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
                onChange={(e) => setSettings(prev => ({ 
                  ...prev, 
                  scheduled_delivery: {
                    ...prev.scheduled_delivery,
                    percentage_of_subtotal: parseFloat(e.target.value) || 0
                  }
                }))}
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
              onChange={(e) => setSettings(prev => ({ 
                ...prev, 
                scheduled_delivery: {
                  ...prev.scheduled_delivery,
                  min_days_advance: parseInt(e.target.value) || 1
                }
              }))}
            />
          </div>
        </div>

        <Button onClick={handleSettingsUpdate} disabled={updateSettingsMutation.isPending}>
          Save Settings
        </Button>
      </CardContent>
    </Card>
  );
};

export default DeliverySettings;
