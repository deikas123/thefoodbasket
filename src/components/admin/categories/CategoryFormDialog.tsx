
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
      <DialogContent className="sm:max-w-[500px]">
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
              <Label htmlFor={`${mode}-name`}>Category Name *</Label>
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
              <Label htmlFor={`${mode}-image`}>Category Image URL *</Label>
              <Input
                id={`${mode}-image`}
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://example.com/category-image.jpg"
                type="url"
              />
              <p className="text-xs text-muted-foreground">
                Enter a direct URL to an image (JPG, PNG, WebP)
              </p>
              
              {/* Image Preview */}
              {formData.image && (
                <div className="mt-2">
                  <Label className="text-sm text-muted-foreground">Preview:</Label>
                  <div className="mt-1 border rounded-lg overflow-hidden w-full h-32 bg-gray-100">
                    <img
                      src={formData.image}
                      alt="Category preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                    />
                  </div>
                </div>
              )}
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
