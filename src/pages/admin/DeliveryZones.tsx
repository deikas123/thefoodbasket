
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PlusCircle, Edit, Trash2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

interface DeliveryZone {
  id: string;
  name: string;
  base_fee: number;
  per_km_fee: number;
  min_delivery_time: number;
  max_delivery_time: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

const DeliveryZones = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<DeliveryZone | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    base_fee: "",
    per_km_fee: "",
    min_delivery_time: "",
    max_delivery_time: "",
    active: true
  });

  const queryClient = useQueryClient();

  const { data: zones, isLoading } = useQuery({
    queryKey: ["delivery-zones"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("delivery_zones")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as DeliveryZone[];
    }
  });

  const createZoneMutation = useMutation({
    mutationFn: async (zoneData: Omit<DeliveryZone, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("delivery_zones")
        .insert(zoneData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["delivery-zones"] });
      setIsDialogOpen(false);
      resetForm();
      toast.success("Delivery zone created successfully");
    },
    onError: (error) => {
      toast.error("Error creating delivery zone: " + error.message);
    }
  });

  const updateZoneMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<DeliveryZone> & { id: string }) => {
      const { data, error } = await supabase
        .from("delivery_zones")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["delivery-zones"] });
      setIsDialogOpen(false);
      setEditingZone(null);
      resetForm();
      toast.success("Delivery zone updated successfully");
    },
    onError: (error) => {
      toast.error("Error updating delivery zone: " + error.message);
    }
  });

  const deleteZoneMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("delivery_zones")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["delivery-zones"] });
      toast.success("Delivery zone deleted successfully");
    },
    onError: (error) => {
      toast.error("Error deleting delivery zone: " + error.message);
    }
  });

  const resetForm = () => {
    setFormData({
      name: "",
      base_fee: "",
      per_km_fee: "",
      min_delivery_time: "",
      max_delivery_time: "",
      active: true
    });
    setEditingZone(null);
  };

  const handleEdit = (zone: DeliveryZone) => {
    setEditingZone(zone);
    setFormData({
      name: zone.name,
      base_fee: zone.base_fee.toString(),
      per_km_fee: zone.per_km_fee.toString(),
      min_delivery_time: zone.min_delivery_time.toString(),
      max_delivery_time: zone.max_delivery_time.toString(),
      active: zone.active
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const zoneData = {
      name: formData.name,
      base_fee: parseFloat(formData.base_fee),
      per_km_fee: parseFloat(formData.per_km_fee),
      min_delivery_time: parseInt(formData.min_delivery_time),
      max_delivery_time: parseInt(formData.max_delivery_time),
      active: formData.active
    };

    if (editingZone) {
      updateZoneMutation.mutate({ id: editingZone.id, ...zoneData });
    } else {
      createZoneMutation.mutate(zoneData);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this delivery zone?")) {
      deleteZoneMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Delivery Zones</h2>
          <p className="text-muted-foreground">
            Manage delivery zones and their pricing
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Delivery Zone
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingZone ? "Edit Delivery Zone" : "New Delivery Zone"}
                </DialogTitle>
                <DialogDescription>
                  Configure delivery zone settings and pricing
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Zone Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Downtown, Suburbs"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="base_fee">Base Fee ($)</Label>
                    <Input
                      id="base_fee"
                      type="number"
                      step="0.01"
                      value={formData.base_fee}
                      onChange={(e) => setFormData(prev => ({ ...prev, base_fee: e.target.value }))}
                      placeholder="5.99"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="per_km_fee">Per KM Fee ($)</Label>
                    <Input
                      id="per_km_fee"
                      type="number"
                      step="0.01"
                      value={formData.per_km_fee}
                      onChange={(e) => setFormData(prev => ({ ...prev, per_km_fee: e.target.value }))}
                      placeholder="1.50"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="min_time">Min Delivery Time (mins)</Label>
                    <Input
                      id="min_time"
                      type="number"
                      value={formData.min_delivery_time}
                      onChange={(e) => setFormData(prev => ({ ...prev, min_delivery_time: e.target.value }))}
                      placeholder="30"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="max_time">Max Delivery Time (mins)</Label>
                    <Input
                      id="max_time"
                      type="number"
                      value={formData.max_delivery_time}
                      onChange={(e) => setFormData(prev => ({ ...prev, max_delivery_time: e.target.value }))}
                      placeholder="60"
                      required
                    />
                  </div>
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
                <Button type="submit" disabled={createZoneMutation.isPending || updateZoneMutation.isPending}>
                  {editingZone ? "Update Zone" : "Create Zone"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-10">Loading delivery zones...</div>
      ) : zones?.length === 0 ? (
        <div className="text-center py-10">
          <MapPin className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No delivery zones</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new delivery zone.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {zones?.map((zone) => (
            <Card key={zone.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{zone.name}</CardTitle>
                  <div className="flex items-center space-x-2">
                    {zone.active ? (
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
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Base Fee:</span>
                    <span>${zone.base_fee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Per KM:</span>
                    <span>${zone.per_km_fee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery Time:</span>
                    <span>{zone.min_delivery_time}-{zone.max_delivery_time} mins</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(zone)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(zone.id)}
                  disabled={deleteZoneMutation.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DeliveryZones;
