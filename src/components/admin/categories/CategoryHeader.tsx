
import React from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

interface CategoryHeaderProps {
  categoriesCount: number;
  onAddCategory: () => void;
}

const CategoryHeader: React.FC<CategoryHeaderProps> = ({ 
  categoriesCount,
  onAddCategory 
}) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
        <p className="text-muted-foreground">
          Manage product categories for your store
        </p>
      </div>
      <Button onClick={onAddCategory}>
        <PlusCircle className="mr-2 h-4 w-4" />
        Add Category
      </Button>
    </div>
  );
};

export default CategoryHeader;
