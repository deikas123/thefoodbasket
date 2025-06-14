
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DeliveryOption } from "@/services/deliveryOptionsService";

interface DeliveryOptionFormProps {
  editingOption: DeliveryOption | null;
  formData: {
    name: string;
    description: string;
    base_price: string;
    price_per_km: string;
    estimated_delivery_days: string;
    is_express: boolean;
    active: boolean;
  };
  setFormData: React.Dispatch<React.SetStateAction<{
    name: string;
    description: string;
    base_price: string;
    price_per_km: string;
    estimated_delivery_days: string;
    is_express: boolean;
    active: boolean;
  }>>;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isCreating: boolean;
  isUpdating: boolean;
}

const DeliveryOptionForm = ({ 
  editingOption, 
  formData, 
  setFormData, 
  onSubmit, 
  onCancel, 
  isCreating, 
  isUpdating 
}: DeliveryOptionFormProps) => {
  return (
    <DialogContent>
      <form onSubmit={onSubmit}>
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
              <Label htmlFor="base_price">Base Price (KSH)</Label>
              <Input
                id="base_price"
                type="number"
                step="0.01"
                value={formData.base_price}
                onChange={(e) => setFormData(prev => ({ ...prev, base_price: e.target.value }))}
                placeholder="150"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="price_per_km">Price per KM (KSH)</Label>
              <Input
                id="price_per_km"
                type="number"
                step="0.01"
                value={formData.price_per_km}
                onChange={(e) => setFormData(prev => ({ ...prev, price_per_km: e.target.value }))}
                placeholder="50"
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
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isCreating || isUpdating}>
            {editingOption ? "Update Option" : "Create Option"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};

export default DeliveryOptionForm;
