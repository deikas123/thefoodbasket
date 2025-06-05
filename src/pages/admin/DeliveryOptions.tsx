
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PlusCircle, Edit, Trash2, Truck, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  getActiveDeliveryOptions,
  createDeliveryOption,
  updateDeliveryOption,
  deleteDeliveryOption,
  DeliveryOption
} from "@/services/deliveryOptionsService";
import { supabase } from "@/integrations/supabase/client";

interface DeliverySettings {
  minimum_checkout_amount: number;
  warehouse_location: {
    lat: number;
    lng: number;
  };
}

const DeliveryOptions = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOption, setEditingOption] = useState<DeliveryOption | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    base_price: "",
    price_per_km: "",
    estimated_delivery_days: "",
    is_express: false,
    active: true
  });

  const [settings, setSettings] = useState<DeliverySettings>({
    minimum_checkout_amount: 50,
    warehouse_location: { lat: -1.2921, lng: 36.8219 } // Nairobi default
  });

  const queryClient = useQueryClient();

  const { data: options, isLoading } = useQuery({
    queryKey: ["delivery-options"],
    queryFn: getActiveDeliveryOptions
  });

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

  const createMutation = useMutation({
    mutationFn: createDeliveryOption,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["delivery-options"] });
      setIsDialogOpen(false);
      resetForm();
      toast.success("Delivery option created successfully");
    },
    onError: (error) => {
      toast.error("Error creating delivery option: " + error.message);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...updates }: { id: string } & Partial<DeliveryOption>) =>
      updateDeliveryOption(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["delivery-options"] });
      setIsDialogOpen(false);
      setEditingOption(null);
      resetForm();
      toast.success("Delivery option updated successfully");
    },
    onError: (error) => {
      toast.error("Error updating delivery option: " + error.message);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDeliveryOption,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["delivery-options"] });
      toast.success("Delivery option deleted successfully");
    },
    onError: (error) => {
      toast.error("Error deleting delivery option: " + error.message);
    }
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      base_price: "",
      price_per_km: "",
      estimated_delivery_days: "",
      is_express: false,
      active: true
    });
    setEditingOption(null);
  };

  const handleEdit = (option: DeliveryOption) => {
    setEditingOption(option);
    setFormData({
      name: option.name,
      description: option.description || "",
      base_price: option.base_price.toString(),
      price_per_km: option.price_per_km?.toString() || "",
      estimated_delivery_days: option.estimated_delivery_days.toString(),
      is_express: option.is_express,
      active: option.active
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const optionData = {
      name: formData.name,
      description: formData.description || undefined,
      base_price: parseFloat(formData.base_price),
      price_per_km: formData.price_per_km ? parseFloat(formData.price_per_km) : undefined,
      estimated_delivery_days: parseInt(formData.estimated_delivery_days),
      is_express: formData.is_express,
      active: formData.active
    };

    if (editingOption) {
      updateMutation.mutate({ id: editingOption.id, ...optionData });
    } else {
      createMutation.mutate(optionData);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this delivery option?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleSettingsUpdate = () => {
    updateSettingsMutation.mutate(settings);
  };

  React.useEffect(() => {
    if (deliverySettings) {
      setSettings(deliverySettings);
    }
  }, [deliverySettings]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Delivery Management</h2>
          <p className="text-muted-foreground">
            Manage delivery options, pricing, and settings
          </p>
        </div>
      </div>

      <Tabs defaultValue="options" className="w-full">
        <TabsList>
          <TabsTrigger value="options">Delivery Options</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-4">
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
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="min-checkout">Minimum Checkout Amount ($)</Label>
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
              <Button onClick={handleSettingsUpdate} disabled={updateSettingsMutation.isPending}>
                Save Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="options" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Delivery Option
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleSubmit}>
                  <DialogHeader>
                    <DialogTitle>
                      {editingOption ? "Edit Delivery Option" : "New Delivery Option"}
                    </DialogTitle>
                    <DialogDescription>
                      Configure delivery option settings and pricing
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Option Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Standard Delivery"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Brief description of the delivery option"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="base_price">Base Price ($)</Label>
                        <Input
                          id="base_price"
                          type="number"
                          step="0.01"
                          value={formData.base_price}
                          onChange={(e) => setFormData(prev => ({ ...prev, base_price: e.target.value }))}
                          placeholder="5.99"
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="price_per_km">Price per KM ($)</Label>
                        <Input
                          id="price_per_km"
                          type="number"
                          step="0.01"
                          value={formData.price_per_km}
                          onChange={(e) => setFormData(prev => ({ ...prev, price_per_km: e.target.value }))}
                          placeholder="1.50"
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="estimated_days">Estimated Delivery Days</Label>
                      <Input
                        id="estimated_days"
                        type="number"
                        value={formData.estimated_delivery_days}
                        onChange={(e) => setFormData(prev => ({ ...prev, estimated_delivery_days: e.target.value }))}
                        placeholder="2"
                        required
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_express"
                        checked={formData.is_express}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_express: checked }))}
                      />
                      <Label htmlFor="is_express">Express Delivery</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="active"
                        checked={formData.active}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, active: checked }))}
                      />
                      <Label htmlFor="active">Active</Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                      {editingOption ? "Update Option" : "Create Option"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {isLoading ? (
            <div className="text-center py-10">Loading delivery options...</div>
          ) : options?.length === 0 ? (
            <div className="text-center py-10">
              <Truck className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No delivery options</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new delivery option.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {options?.map((option) => (
                <Card key={option.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{option.name}</CardTitle>
                      <div className="flex items-center space-x-2">
                        {option.is_express && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                            Express
                          </span>
                        )}
                        {option.active ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Inactive
                          </span>
                        )}
                      </div>
                    </div>
                    {option.description && (
                      <CardDescription>{option.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Base Price:</span>
                        <span>${option.base_price}</span>
                      </div>
                      {option.price_per_km && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Per KM:</span>
                          <span>${option.price_per_km}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Delivery Time:</span>
                        <span>{option.estimated_delivery_days} days</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(option)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(option.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DeliveryOptions;
