
import React from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { Category } from "@/services/product/categoryService";

interface CategoryFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: {
    name: string;
    description: string;
    image: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<{
    name: string;
    description: string;
    image: string;
  }>>;
  isSubmitting: boolean;
  mode: "add" | "edit";
  resetForm: () => void;
}

const CategoryFormDialog: React.FC<CategoryFormDialogProps> = ({
  isOpen,
  onOpenChange,
  onSubmit,
  formData,
  setFormData,
  isSubmitting,
  mode,
  resetForm,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "Add New Category" : "Edit Category"}</DialogTitle>
          <DialogDescription>
            {mode === "add" 
              ? "Create a new category for your products." 
              : "Update the details for this category."
            }
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor={`${mode}-name`}>Name *</Label>
              <Input
                id={`${mode}-name`}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Fruits & Vegetables"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor={`${mode}-description`}>Description</Label>
              <Textarea
                id={`${mode}-description`}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Fresh produce from local farms..."
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor={`${mode}-image`}>Image URL</Label>
              <Input
                id={`${mode}-image`}
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
              <p className="text-xs text-muted-foreground">
                {mode === "add" 
                  ? "Leave empty to use a placeholder image" 
                  : "Leave empty to keep existing image"
                }
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                onOpenChange(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting 
                ? (mode === "add" ? "Creating..." : "Updating...") 
                : (mode === "add" ? "Create Category" : "Update Category")
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryFormDialog;
