import { useState } from "react";
import { DynamicBadge } from "@/components/ui/dynamic-badge";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";

interface ProductImageGalleryProps {
  images?: string[];
  image: string;
  name: string;
  discountPercentage?: number;
  featured?: boolean;
}

const ProductImageGallery = ({
  images,
  image,
  name,
  discountPercentage,
  featured
}: ProductImageGalleryProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  
  const allImages = images && images.length > 0 ? images : [image];
  
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: allImages.length > 1,
    align: "center"
  });

  const getImageUrl = (imageData: string) => {
    if (!imageData) return '/placeholder.svg';
    if (imageData.startsWith('data:')) return imageData;
    if (imageData.startsWith('http') || imageData.startsWith('/')) return imageData;
    return `data:image/jpeg;base64,${imageData}`;
  };

  const scrollPrev = () => {
    if (emblaApi) {
      emblaApi.scrollPrev();
      setSelectedIndex(emblaApi.selectedScrollSnap());
    }
  };

  const scrollNext = () => {
    if (emblaApi) {
      emblaApi.scrollNext();
      setSelectedIndex(emblaApi.selectedScrollSnap());
    }
  };

  return (
    <div className="space-y-4">
      {/* Main Image with Carousel */}
      <div className="relative group">
        <div className="overflow-hidden rounded-3xl" ref={emblaRef}>
          <div className="flex">
            {allImages.map((img, index) => (
              <div key={index} className="flex-[0_0_100%] min-w-0">
                <div className="aspect-square bg-muted relative">
                  <Zoom>
                    <img 
                      src={getImageUrl(img)} 
                      alt={`${name} - ${index + 1}`}
                      className="w-full h-full object-contain p-4"
                    />
                  </Zoom>
                  
                  {index === 0 && (
                    <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
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
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Arrows */}
        {allImages.length > 1 && (
          <>
            <Button
              variant="secondary"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
              onClick={scrollPrev}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
              onClick={scrollNext}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </>
        )}

        {/* Zoom Indicator */}
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5">
            <ZoomIn className="h-3 w-3" />
            Click to zoom
          </div>
        </div>
      </div>

      {/* Thumbnail Gallery */}
      {allImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {allImages.map((img, index) => (
            <button
              key={index}
              onClick={() => {
                emblaApi?.scrollTo(index);
                setSelectedIndex(index);
              }}
              className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                selectedIndex === index 
                  ? 'border-primary ring-2 ring-primary/20' 
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <img 
                src={getImageUrl(img)} 
                alt={`${name} thumbnail ${index + 1}`}
                className="w-full h-full object-contain p-1 bg-muted"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductImageGallery;
