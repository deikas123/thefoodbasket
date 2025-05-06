
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tag, X } from "lucide-react";
import { createTag, getAllTags, deleteTag } from "@/services/product/tagService";

export type ProductTag = {
  id: string;
  name: string;
  created_at: string;
};

const TagsManager = () => {
  const [newTagName, setNewTagName] = useState("");
  const queryClient = useQueryClient();

  const { data: tags, isLoading, error } = useQuery({
    queryKey: ["product-tags"],
    queryFn: getAllTags
  });

  const addTagMutation = useMutation({
    mutationFn: createTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-tags"] });
      toast("Tag added successfully");
      setNewTagName("");
    },
    onError: (error) => {
      console.error("Error adding tag:", error);
      toast("Failed to add tag");
    }
  });

  const deleteTagMutation = useMutation({
    mutationFn: deleteTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-tags"] });
      toast("Tag deleted successfully");
    },
    onError: (error) => {
      console.error("Error deleting tag:", error);
      toast("Failed to delete tag");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;
    
    addTagMutation.mutate(newTagName);
  };

  const handleDeleteTag = (id: string) => {
    deleteTagMutation.mutate(id);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tag className="h-5 w-5" />
          Product Tags
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
          <Input 
            placeholder="Enter new tag name"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            className="max-w-xs"
          />
          <Button type="submit" disabled={addTagMutation.isPending || !newTagName.trim()}>
            Add Tag
          </Button>
        </form>

        {error ? (
          <div className="text-red-500">Failed to load tags</div>
        ) : isLoading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-8 w-full max-w-xs" />
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {tags?.map((tag) => (
              <div 
                key={tag.id}
                className="flex items-center gap-1 bg-secondary text-secondary-foreground px-2 py-1 rounded-md"
              >
                {tag.name}
                <button 
                  onClick={() => handleDeleteTag(tag.id)}
                  className="ml-1 hover:text-red-500"
                  aria-label={`Delete ${tag.name} tag`}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {tags?.length === 0 && (
              <p className="text-muted-foreground">No tags created yet</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TagsManager;
