
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  placeholderColor?: string;
  aspectRatio?: string;
}

const LazyImage = ({
  src,
  alt,
  className,
  placeholderColor = "bg-gray-200 dark:bg-gray-700",
  aspectRatio = "aspect-square",
  ...props
}: LazyImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | undefined>(undefined);

  useEffect(() => {
    // Reset state when src changes
    setIsLoaded(false);
    
    // Create image object to preload
    const img = new Image();
    img.src = src || '';
    img.onload = () => {
      setImageSrc(src);
      setIsLoaded(true);
    };
    
    return () => {
      img.onload = null;
    };
  }, [src]);

  return (
    <div className={cn("overflow-hidden relative", aspectRatio)}>
      {!isLoaded && (
        <div className={cn("absolute inset-0 animate-pulse", placeholderColor)} />
      )}
      {src && (
        <img
          src={imageSrc}
          alt={alt || ''}
          className={cn(
            "object-cover w-full h-full transition-opacity duration-300",
            isLoaded ? "opacity-100" : "opacity-0",
            className
          )}
          {...props}
        />
      )}
    </div>
  );
};

export default LazyImage;
