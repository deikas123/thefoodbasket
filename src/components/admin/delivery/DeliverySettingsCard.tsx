
import React from "react";
import { Settings } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DeliverySettingsForm from "./DeliverySettingsForm";
import { useDeliverySettings } from "./useDeliverySettings";

const DeliverySettingsCard = () => {
  const { settings, setSettings, isLoading, handleSettingsUpdate, isSaving } = useDeliverySettings();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="mr-2 h-5 w-5" />
            Delivery Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading settings...</p>
        </CardContent>
      </Card>
    );
  }

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
        <DeliverySettingsForm 
          settings={settings}
          onSettingsChange={setSettings}
        />
        
        <Button 
          onClick={handleSettingsUpdate} 
          disabled={isSaving}
          className="w-full"
        >
          {isSaving ? "Saving..." : "Save Settings"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default DeliverySettingsCard;
