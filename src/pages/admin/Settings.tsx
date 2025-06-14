
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Settings = () => {
  const [deliverySettings, setDeliverySettings] = useState({
    minimumCheckout: 1500,
    freeDeliveryThreshold: 2000,
    expressDeliveryEnabled: true
  });

  const queryClient = useQueryClient();

  const { data: currentSettings } = useQuery({
    queryKey: ["delivery-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('website_sections')
        .select('settings')
        .eq('type', 'delivery_settings')
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data?.settings || deliverySettings;
    }
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: typeof deliverySettings) => {
      const { error } = await supabase
        .from('website_sections')
        .upsert({
          name: 'delivery_settings',
          type: 'delivery_settings',
          title: 'Delivery Settings',
          settings: {
            minimum_checkout_amount: newSettings.minimumCheckout,
            free_delivery_threshold: newSettings.freeDeliveryThreshold,
            express_delivery_enabled: newSettings.expressDeliveryEnabled
          }
        }, { onConflict: 'type' });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["delivery-settings"] });
      toast.success("Settings updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update settings: " + error.message);
    }
  });

  const handleDeliverySettingsUpdate = () => {
    updateSettingsMutation.mutate(deliverySettings);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your application settings and preferences
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="delivery">Delivery</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Site Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="site-name">Site Name</Label>
                  <Input id="site-name" placeholder="Your Store Name" />
                </div>
                <div>
                  <Label htmlFor="site-email">Contact Email</Label>
                  <Input id="site-email" type="email" placeholder="contact@yourstore.com" />
                </div>
              </div>
              <div>
                <Label htmlFor="site-description">Site Description</Label>
                <Input id="site-description" placeholder="Brief description of your store" />
              </div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Business Hours</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="open-time">Opening Time</Label>
                  <Input id="open-time" type="time" defaultValue="09:00" />
                </div>
                <div>
                  <Label htmlFor="close-time">Closing Time</Label>
                  <Input id="close-time" type="time" defaultValue="21:00" />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="24-hours" />
                <Label htmlFor="24-hours">Open 24 hours</Label>
              </div>
              <Button>Update Hours</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="delivery" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Settings</CardTitle>
              <p className="text-sm text-muted-foreground">
                Configure delivery options and minimum order amounts
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="min-checkout">Minimum Checkout Amount (KSH)</Label>
                  <Input 
                    id="min-checkout" 
                    type="number" 
                    value={deliverySettings.minimumCheckout}
                    onChange={(e) => setDeliverySettings(prev => ({
                      ...prev,
                      minimumCheckout: parseInt(e.target.value) || 0
                    }))}
                    placeholder="1500" 
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Minimum order amount required for checkout
                  </p>
                </div>
                <div>
                  <Label htmlFor="free-delivery">Free Delivery Threshold (KSH)</Label>
                  <Input 
                    id="free-delivery" 
                    type="number" 
                    value={deliverySettings.freeDeliveryThreshold}
                    onChange={(e) => setDeliverySettings(prev => ({
                      ...prev,
                      freeDeliveryThreshold: parseInt(e.target.value) || 0
                    }))}
                    placeholder="2000" 
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Orders above this amount get free delivery
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="express-delivery" 
                  checked={deliverySettings.expressDeliveryEnabled}
                  onCheckedChange={(checked) => setDeliverySettings(prev => ({
                    ...prev,
                    expressDeliveryEnabled: checked
                  }))}
                />
                <Label htmlFor="express-delivery">Enable Express Delivery</Label>
              </div>
              <Button 
                onClick={handleDeliverySettingsUpdate}
                disabled={updateSettingsMutation.isPending}
              >
                {updateSettingsMutation.isPending ? "Saving..." : "Save Delivery Settings"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Delivery Methods Management</CardTitle>
              <p className="text-sm text-muted-foreground">
                Manage available delivery options for customers
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  To manage delivery methods, pricing, and zones, visit the dedicated Delivery Options page.
                </p>
                <Button variant="outline" asChild>
                  <a href="/admin/delivery-options">Manage Delivery Options</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="mpesa">M-Pesa</Label>
                  <Switch id="mpesa" defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <Label htmlFor="card">Credit/Debit Card</Label>
                  <Switch id="card" defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <Label htmlFor="wallet">Wallet Payment</Label>
                  <Switch id="wallet" defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <Label htmlFor="pay-later">Pay Later</Label>
                  <Switch id="pay-later" defaultChecked />
                </div>
              </div>
              <Button>Update Payment Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="order-notifications">Order Status Notifications</Label>
                  <Switch id="order-notifications" defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <Label htmlFor="promo-notifications">Promotional Notifications</Label>
                  <Switch id="promo-notifications" defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <Switch id="email-notifications" defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <Label htmlFor="sms-notifications">SMS Notifications</Label>
                  <Switch id="sms-notifications" />
                </div>
              </div>
              <Button>Save Notification Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
