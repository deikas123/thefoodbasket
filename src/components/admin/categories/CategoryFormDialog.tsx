
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
import CategoryImageUpload from "./CategoryImageUpload";
import { Category } from "@/services/product/categoryService";

interface CategoryFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: {
    name: string;
    description: string;
    image: string;
    parentId?: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<{
    name: string;
    description: string;
    image: string;
    parentId?: string;
  }>>;
  isSubmitting: boolean;
  mode: "add" | "edit";
  resetForm: () => void;
  categories: Category[];
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
  categories
}) => {
  
  // Get all categories for parent selection (flatten hierarchy)
  const getAllCategories = (cats: Category[]): Category[] => {
    const result: Category[] = [];
    cats.forEach(cat => {
      result.push(cat);
      if (cat.subcategories) {
        result.push(...getAllCategories(cat.subcategories));
      }
    });
    return result;
  };
  
  const allCategories = getAllCategories(categories);
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

            <div className="space-y-2">
              <label className="text-sm font-medium">Parent Category (Optional)</label>
              <select
                value={formData.parentId || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, parentId: e.target.value || undefined }))}
                className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">No Parent (Root Category)</option>
                {allCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <CategoryImageUpload
              value={formData.image}
              onChange={(image) => setFormData({ ...formData, image })}
            />
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
