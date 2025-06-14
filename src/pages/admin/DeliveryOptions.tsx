
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  getActiveDeliveryOptions,
  createDeliveryOption,
  updateDeliveryOption,
  deleteDeliveryOption,
  DeliveryOption
} from "@/services/deliveryOptionsService";
import DeliverySettings from "@/components/admin/delivery/DeliverySettings";
import DeliveryOptionForm from "@/components/admin/delivery/DeliveryOptionForm";
import DeliveryOptionsList from "@/components/admin/delivery/DeliveryOptionsList";

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

  const queryClient = useQueryClient();

  const { data: options, isLoading } = useQuery({
    queryKey: ["delivery-options"],
    queryFn: getActiveDeliveryOptions
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
          <DeliverySettings />
        </TabsContent>

        <TabsContent value="options" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Delivery Option
                </Button>
              </DialogTrigger>
              <DeliveryOptionForm
                editingOption={editingOption}
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleSubmit}
                onCancel={() => setIsDialogOpen(false)}
                isCreating={createMutation.isPending}
                isUpdating={updateMutation.isPending}
              />
            </Dialog>
          </div>

          <DeliveryOptionsList
            options={options}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isDeleting={deleteMutation.isPending}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DeliveryOptions;
