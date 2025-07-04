
import { useState, useEffect, useRef } from 'react';
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
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!imgRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { 
        threshold,
        rootMargin: '50px' // Start loading 50px before the image comes into view
      }
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, [threshold]);

  useEffect(() => {
    if (!isInView || !src) return;

    // Create a new image to preload
    const img = new Image();
    
    const handleLoad = () => {
      setImageSrc(src);
      setIsLoaded(true);
    };

    const handleError = () => {
      console.warn('Failed to load image:', src);
      setIsLoaded(false);
    };

    img.addEventListener('load', handleLoad);
    img.addEventListener('error', handleError);
    img.src = src;
    
    return () => {
      img.removeEventListener('load', handleLoad);
      img.removeEventListener('error', handleError);
    };
  }, [src, isInView]);

  return (
    <div 
      ref={imgRef}
      className={cn("overflow-hidden relative", aspectRatio)}
    >
      {!isLoaded && (
        <div className={cn("absolute inset-0 animate-pulse", placeholderColor)} />
      )}
      {src && isInView && (
        <img
          src={imageSrc}
          alt={alt || ''}
          loading="lazy"
          decoding="async"
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
