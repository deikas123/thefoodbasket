import { DynamicBadge } from "@/components/ui/dynamic-badge";
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
  // Handle image URL - support both base64 and regular URLs
  const getImageUrl = (imageData: string) => {
    if (!imageData) return '/placeholder.svg';
    
    // If it's already a base64 data URL, return as is
    if (imageData.startsWith('data:')) {
      return imageData;
    }
    
    // If it's a regular URL, return as is
    if (imageData.startsWith('http') || imageData.startsWith('/')) {
      return imageData;
    }
    
    // Otherwise, assume it's base64 without the data URL prefix
    return `data:image/jpeg;base64,${imageData}`;
  };

  const imageUrl = getImageUrl(image);

  return (
    <div className="relative">
      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
        <img 
          src={imageUrl} 
          alt={name} 
          className="w-full h-full object-cover"
          onError={(e) => {
            console.log('Gallery image failed to load:', imageUrl);
            e.currentTarget.src = '/placeholder.svg';
          }}
          onLoad={() => {
            console.log('Gallery image loaded successfully:', imageUrl);
          }}
        />
      </div>
      
      <div className="absolute top-4 left-4 flex flex-col gap-2">
        {discountPercentage && (
          <DynamicBadge variant="discount">
            {discountPercentage}% OFF
          </DynamicBadge>
        )}
        
        {featured && (
          <DynamicBadge variant="featured">
            Featured
          </DynamicBadge>
        )}
      </div>
    </div>
  );
};

export default ProductImageGallery;
