
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { 
  getCategoriesWithCounts, 
  createCategory, 
  updateCategory, 
  deleteCategory, 
  Category 
} from "@/services/categoryService";

import CategoryHeader from "@/components/admin/categories/CategoryHeader";
import CategoryList from "@/components/admin/categories/CategoryList";
import CategoryFormDialog from "@/components/admin/categories/CategoryFormDialog";

const ITEMS_PER_PAGE = 10;

const Categories = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "",
    parentId: undefined as string | undefined
  });
  
  // Fetch categories
  const { data: categories = [], isLoading, error } = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: getCategoriesWithCounts
  });
  
  // Create category mutation
  const createMutation = useMutation({
    mutationFn: (data: { name: string; description: string; image: string; parentId?: string }) => 
      createCategory(data.name, data.description, data.image, data.parentId),
    onSuccess: () => {
      toast.success("Category created", {
        description: "The category has been created successfully."
      });
      setIsAddDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      resetForm();
    },
    onError: (error) => {
      toast.error("Error", {
        description: "Failed to create category. Please try again."
      });
      console.error("Error creating category:", error);
    }
  });
  
  // Update category mutation
  const updateMutation = useMutation({
    mutationFn: (data: { id: string; updates: Partial<Category> }) => 
      updateCategory(data.id, data.updates),
    onSuccess: () => {
      toast.success("Category updated", {
        description: "The category has been updated successfully."
      });
      setIsEditDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      resetForm();
    },
    onError: (error) => {
      toast.error("Error", {
        description: "Failed to update category. Please try again."
      });
      console.error("Error updating category:", error);
    }
  });
  
  // Delete category mutation
  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      toast.success("Category deleted", {
        description: "The category has been deleted successfully."
      });
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
    },
    onError: (error) => {
      toast.error("Error", {
        description: "Failed to delete category. Please try again."
      });
      console.error("Error deleting category:", error);
    }
  });
  
  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      image: "",
      parentId: undefined
    });
    setCurrentCategory(null);
  };
  
  // Open edit dialog
  const handleEdit = (category: Category) => {
    setCurrentCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
      image: category.image || "",
      parentId: category.parentId
    });
    setIsEditDialogOpen(true);
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error("Validation Error", {
        description: "Category name is required."
      });
      return;
    }
    
    if (isEditDialogOpen && currentCategory) {
      updateMutation.mutate({
        id: currentCategory.id,
        updates: {
          name: formData.name,
          description: formData.description,
          image: formData.image,
          parentId: formData.parentId
        }
      });
    } else {
      createMutation.mutate(formData);
    }
  };
  
  return (
    <div className="space-y-6">
      <CategoryHeader 
        categoriesCount={categories.length}
        onAddCategory={() => setIsAddDialogOpen(true)}
      />
      
      <Card>
        <CardHeader>
          <CardTitle>All Categories</CardTitle>
          <CardDescription>
            You have {categories.length} categories in total
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CategoryList 
            categories={categories}
            isLoading={isLoading}
            error={error}
            page={page}
            setPage={setPage}
            handleEdit={handleEdit}
            handleDelete={(id) => deleteMutation.mutate(id)}
            itemsPerPage={ITEMS_PER_PAGE}
          />
        </CardContent>
      </Card>
      
      {/* Add Category Dialog */}
      <CategoryFormDialog
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSubmit={handleSubmit}
        formData={formData}
        setFormData={setFormData}
        isSubmitting={createMutation.isPending}
        mode="add"
        resetForm={resetForm}
        categories={categories}
      />
      
      {/* Edit Category Dialog */}
      <CategoryFormDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSubmit={handleSubmit}
        formData={formData}
        setFormData={setFormData}
        isSubmitting={updateMutation.isPending}
        mode="edit"
        resetForm={resetForm}
        categories={categories}
      />
    </div>
  );
};

export default Categories;
