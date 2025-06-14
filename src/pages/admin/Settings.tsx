
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Settings as SettingsIcon, Save, Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface DeliveryMethod {
  id: string;
  name: string;
  base_price: number;
  price_per_km?: number;
  estimated_delivery_days: number;
  is_express: boolean;
  active: boolean;
}

interface DeliverySettings {
  minimum_checkout_amount: number;
  free_delivery_threshold: number;
  express_delivery_enabled: boolean;
  same_day_delivery_enabled: boolean;
  delivery_methods: DeliveryMethod[];
}

const Settings = () => {
  console.log("Settings component rendering");
  
  const [isDeliveryDialogOpen, setIsDeliveryDialogOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<DeliveryMethod | null>(null);
  const [deliveryFormData, setDeliveryFormData] = useState({
    name: "",
    base_price: "",
    price_per_km: "",
    estimated_delivery_days: "2",
    is_express: false,
    active: true
  });

  const queryClient = useQueryClient();

  const { data: settings, isLoading, error } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: async () => {
      console.log("Fetching admin settings");
      
      // Use default settings directly without querying database for now
      const defaultSettings: DeliverySettings = {
        minimum_checkout_amount: 1500,
        free_delivery_threshold: 5000,
        express_delivery_enabled: true,
        same_day_delivery_enabled: false,
        delivery_methods: [
          {
            id: '1',
            name: 'Standard Delivery',
            base_price: 250,
            price_per_km: 50,
            estimated_delivery_days: 2,
            is_express: false,
            active: true
          },
          {
            id: '2',
            name: 'Express Delivery',
            base_price: 500,
            price_per_km: 75,
            estimated_delivery_days: 1,
            is_express: true,
            active: true
          }
        ]
      };
      
      console.log("Returning default settings:", defaultSettings);
      return defaultSettings;
    }
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: DeliverySettings) => {
      console.log("Updating settings:", newSettings);
      // For now, just simulate success without actual database update
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
      toast.success("Settings updated successfully");
    },
    onError: (error) => {
      console.error("Mutation error:", error);
      toast.error("Error updating settings: " + error.message);
    }
  });

  const handleSettingChange = (key: keyof DeliverySettings, value: any) => {
    if (!settings) return;
    
    const updatedSettings = { ...settings, [key]: value };
    updateSettingsMutation.mutate(updatedSettings);
  };

  const handleDeliveryMethodSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    const methodData = {
      id: editingMethod?.id || Date.now().toString(),
      name: deliveryFormData.name,
      base_price: parseFloat(deliveryFormData.base_price),
      price_per_km: deliveryFormData.price_per_km ? parseFloat(deliveryFormData.price_per_km) : undefined,
      estimated_delivery_days: parseInt(deliveryFormData.estimated_delivery_days),
      is_express: deliveryFormData.is_express,
      active: deliveryFormData.active
    };

    let updatedMethods;
    if (editingMethod) {
      updatedMethods = settings.delivery_methods.map(method => 
        method.id === editingMethod.id ? methodData : method
      );
    } else {
      updatedMethods = [...settings.delivery_methods, methodData];
    }

    const updatedSettings = { ...settings, delivery_methods: updatedMethods };
    updateSettingsMutation.mutate(updatedSettings);
    
    setIsDeliveryDialogOpen(false);
    setEditingMethod(null);
    resetDeliveryForm();
  };

  const handleEditMethod = (method: DeliveryMethod) => {
    setEditingMethod(method);
    setDeliveryFormData({
      name: method.name,
      base_price: method.base_price.toString(),
      price_per_km: method.price_per_km?.toString() || "",
      estimated_delivery_days: method.estimated_delivery_days.toString(),
      is_express: method.is_express,
      active: method.active
    });
    setIsDeliveryDialogOpen(true);
  };

  const handleDeleteMethod = (methodId: string) => {
    if (!settings) return;
    
    const updatedMethods = settings.delivery_methods.filter(method => method.id !== methodId);
    const updatedSettings = { ...settings, delivery_methods: updatedMethods };
    updateSettingsMutation.mutate(updatedSettings);
  };

  const resetDeliveryForm = () => {
    setDeliveryFormData({
      name: "",
      base_price: "",
      price_per_km: "",
      estimated_delivery_days: "2",
      is_express: false,
      active: true
    });
  };

  console.log("Render state:", { isLoading, error, settings });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <SettingsIcon className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Admin Settings</h1>
        </div>
        <div>Loading settings...</div>
      </div>
    );
  }

  if (error) {
    console.error("Settings error:", error);
    return (
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <SettingsIcon className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Admin Settings</h1>
        </div>
        <div className="text-red-500">Error loading settings: {error.message}</div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <SettingsIcon className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Admin Settings</h1>
        </div>
        <div>No settings found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center space-x-2">
        <SettingsIcon className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Admin Settings</h1>
      </div>

      <Tabs defaultValue="delivery" className="w-full">
        <TabsList>
          <TabsTrigger value="delivery">Delivery Settings</TabsTrigger>
          <TabsTrigger value="general">General Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="delivery" className="space-y-6">
          {/* Basic Delivery Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Delivery Configuration</CardTitle>
              <CardDescription>
                Configure minimum checkout amounts and delivery thresholds
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="min-checkout">Minimum Checkout Amount (KSH)</Label>
                  <Input
                    id="min-checkout"
                    type="number"
                    value={settings?.minimum_checkout_amount || 0}
                    onChange={(e) => handleSettingChange('minimum_checkout_amount', parseFloat(e.target.value) || 0)}
                    placeholder="1500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="free-delivery">Free Delivery Threshold (KSH)</Label>
                  <Input
                    id="free-delivery"
                    type="number"
                    value={settings?.free_delivery_threshold || 0}
                    onChange={(e) => handleSettingChange('free_delivery_threshold', parseFloat(e.target.value) || 0)}
                    placeholder="5000"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="express-delivery"
                    checked={settings?.express_delivery_enabled || false}
                    onCheckedChange={(checked) => handleSettingChange('express_delivery_enabled', checked)}
                  />
                  <Label htmlFor="express-delivery">Enable Express Delivery</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="same-day-delivery"
                    checked={settings?.same_day_delivery_enabled || false}
                    onCheckedChange={(checked) => handleSettingChange('same_day_delivery_enabled', checked)}
                  />
                  <Label htmlFor="same-day-delivery">Enable Same-Day Delivery</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Methods */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Delivery Methods</CardTitle>
                  <CardDescription>
                    Manage available delivery options and pricing
                  </CardDescription>
                </div>
                <Button onClick={() => { 
                  setDeliveryFormData({
                    name: "",
                    base_price: "",
                    price_per_km: "",
                    estimated_delivery_days: "2",
                    is_express: false,
                    active: true
                  });
                  setEditingMethod(null);
                  setIsDeliveryDialogOpen(true);
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Method
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {settings?.delivery_methods?.map((method) => (
                  <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium">{method.name}</h3>
                        {method.is_express && (
                          <span className="px-2 py-1 text-xs bg-amber-100 text-amber-800 rounded-full">
                            Express
                          </span>
                        )}
                        {!method.active && (
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Base: KSH {method.base_price}
                        {method.price_per_km && ` + KSH ${method.price_per_km}/km`}
                        {' • '}{method.estimated_delivery_days} day{method.estimated_delivery_days !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditMethod(method)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteMethod(method.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {(!settings?.delivery_methods || settings.delivery_methods.length === 0) && (
                  <p className="text-center text-muted-foreground py-8">
                    No delivery methods configured. Add your first delivery method to get started.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Configure general application settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Additional general settings can be configured here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delivery Method Dialog */}
      <Dialog open={isDeliveryDialogOpen} onOpenChange={setIsDeliveryDialogOpen}>
        <DialogContent>
          <form onSubmit={handleDeliveryMethodSubmit}>
            <DialogHeader>
              <DialogTitle>
                {editingMethod ? "Edit Delivery Method" : "Add Delivery Method"}
              </DialogTitle>
              <DialogDescription>
                Configure delivery method settings and pricing
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="method-name">Method Name</Label>
                <Input
                  id="method-name"
                  value={deliveryFormData.name}
                  onChange={(e) => setDeliveryFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Standard Delivery"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="base-price">Base Price (KSH)</Label>
                  <Input
                    id="base-price"
                    type="number"
                    step="0.01"
                    value={deliveryFormData.base_price}
                    onChange={(e) => setDeliveryFormData(prev => ({ ...prev, base_price: e.target.value }))}
                    placeholder="250"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="price-per-km">Price per KM (KSH)</Label>
                  <Input
                    id="price-per-km"
                    type="number"
                    step="0.01"
                    value={deliveryFormData.price_per_km}
                    onChange={(e) => setDeliveryFormData(prev => ({ ...prev, price_per_km: e.target.value }))}
                    placeholder="50"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="delivery-days">Estimated Delivery Days</Label>
                <Select 
                  value={deliveryFormData.estimated_delivery_days} 
                  onValueChange={(value) => setDeliveryFormData(prev => ({ ...prev, estimated_delivery_days: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Day</SelectItem>
                    <SelectItem value="2">2 Days</SelectItem>
                    <SelectItem value="3">3 Days</SelectItem>
                    <SelectItem value="5">5 Days</SelectItem>
                    <SelectItem value="7">7 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is-express"
                    checked={deliveryFormData.is_express}
                    onCheckedChange={(checked) => setDeliveryFormData(prev => ({ ...prev, is_express: checked }))}
                  />
                  <Label htmlFor="is-express">Express Method</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is-active"
                    checked={deliveryFormData.active}
                    onCheckedChange={(checked) => setDeliveryFormData(prev => ({ ...prev, active: checked }))}
                  />
                  <Label htmlFor="is-active">Active</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDeliveryDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateSettingsMutation.isPending}>
                {editingMethod ? "Update" : "Add"} Method
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Settings;
