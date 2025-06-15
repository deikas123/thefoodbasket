
import React from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
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

const defaultSettings: DeliverySettings = {
  minimum_checkout_amount: 1500,
  warehouse_location: { lat: -1.2921, lng: 36.8219 },
  scheduled_delivery: {
    pricing_type: 'free',
    min_days_advance: 1
  }
};

export const useDeliverySettings = () => {
  const [settings, setSettings] = React.useState<DeliverySettings>(defaultSettings);
  const queryClient = useQueryClient();

  const { data: deliverySettings, isLoading } = useQuery({
    queryKey: ["delivery-settings"],
    queryFn: async () => {
      console.log("Fetching delivery settings using new function...");
      
      const { data, error } = await supabase.rpc('get_delivery_settings');
      
      if (error) {
        console.error("Error fetching delivery settings:", error);
        return null;
      }
      
      console.log("Successfully fetched delivery settings:", data);
      return data;
    }
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: DeliverySettings) => {
      console.log("Saving delivery settings using new function:", newSettings);
      
      const { data, error } = await supabase.rpc('upsert_delivery_settings', { 
        settings_data: newSettings 
      });
      
      if (error) {
        console.error("Error saving delivery settings:", error);
        throw new Error(`Failed to save settings: ${error.message}`);
      }
      
      console.log("Successfully saved delivery settings:", data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["delivery-settings"] });
      toast.success("Delivery settings saved successfully!");
    },
    onError: (error: Error) => {
      console.error("Failed to save settings:", error);
      toast.error(`Failed to save settings: ${error.message}`);
    }
  });

  React.useEffect(() => {
    if (deliverySettings) {
      console.log("Setting state with fetched settings:", deliverySettings);
      setSettings(deliverySettings);
    }
  }, [deliverySettings]);

  const handleSettingsUpdate = () => {
    console.log("Attempting to save settings:", settings);
    updateSettingsMutation.mutate(settings);
  };

  return {
    settings,
    setSettings,
    isLoading,
    handleSettingsUpdate,
    isSaving: updateSettingsMutation.isPending
  };
};
