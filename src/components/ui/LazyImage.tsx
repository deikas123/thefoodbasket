
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  placeholderColor?: string;
  aspectRatio?: string;
  threshold?: number;
}

const LazyImage = ({
  src,
  alt,
  className,
  placeholderColor = "bg-gray-200 dark:bg-gray-700",
  aspectRatio = "aspect-square",
  threshold = 0.1,
  ...props
}: LazyImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | undefined>(undefined);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    // Use Intersection Observer to detect when the image is in view
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    const currentElement = document.getElementById(`lazy-img-${props.id || Math.random().toString(36)}`);
    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      observer.disconnect();
    };
  }, [threshold, props.id]);

  useEffect(() => {
    // Reset state when src changes
    setIsLoaded(false);
    
    if (!isInView) return;

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
  }, [src, isInView]);

  return (
    <div 
      id={`lazy-img-${props.id || Math.random().toString(36)}`}
      className={cn("overflow-hidden relative", aspectRatio)}
    >
      {(!isLoaded || !isInView) && (
        <div className={cn("absolute inset-0 animate-pulse", placeholderColor)} />
      )}
      {src && isInView && (
        <img
          src={imageSrc}
          alt={alt || ''}
          loading="lazy"
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
