
import { Badge } from "@/components/ui/badge";

interface ProductImageGalleryProps {
  image: string;
  name: string;
  discountPercentage?: number;
  featured?: boolean;
}

const ProductImageGallery = ({
  image,
  name,
  discountPercentage,
  featured
}: ProductImageGalleryProps) => {
  return (
    <div className="relative">
      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
        <img 
          src={image} 
          alt={name} 
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="absolute top-4 left-4 flex flex-col gap-2">
        {discountPercentage && (
          <Badge className="bg-red-500 text-white">
            {discountPercentage}% OFF
          </Badge>
        )}
        
        {featured && (
          <Badge variant="outline" className="bg-white/80 backdrop-blur-sm">
            Featured
          </Badge>
        )}
      </div>
    </div>
  );
};

export default ProductImageGallery;
