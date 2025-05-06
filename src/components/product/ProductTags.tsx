
import { useQuery } from "@tanstack/react-query";
import { Tag as TagIcon } from "lucide-react";
import { getProductTags } from "@/services/product/tagService";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductTagsProps {
  productId: string;
}

const ProductTags = ({ productId }: ProductTagsProps) => {
  const { data: tags, isLoading } = useQuery({
    queryKey: ["product-tags", productId],
    queryFn: () => getProductTags(productId),
    enabled: !!productId
  });

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 mb-4">
        <TagIcon className="h-4 w-4 text-muted-foreground" />
        <div className="flex gap-1">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-6 w-16 rounded-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!tags || tags.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <TagIcon className="h-4 w-4 text-muted-foreground" />
      {tags.map(tag => (
        <span 
          key={tag.id}
          className="bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded-full"
        >
          {tag.name}
        </span>
      ))}
    </div>
  );
};

export default ProductTags;
