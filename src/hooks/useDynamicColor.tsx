
import { useState, useEffect, useRef } from 'react';
import { extractDominantColor, getContrastColor, getDarkerShade } from '@/utils/colorExtractor';

interface DynamicColorResult {
  backgroundColor: string;
  textColor: string;
  hoverColor: string;
  isLoading: boolean;
}

export const useDynamicColor = (imageUrl: string): DynamicColorResult => {
  const [colors, setColors] = useState<DynamicColorResult>({
    backgroundColor: 'rgb(59, 130, 246)', // default blue
    textColor: '#ffffff',
    hoverColor: 'rgb(37, 99, 235)',
    isLoading: true
  });
  
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Skip extraction for placeholder images
    if (!imageUrl || 
        imageUrl === '/placeholder.svg' || 
        imageUrl.includes('placeholder') ||
        imageUrl.includes('data:image/svg')) {
      setColors(prev => ({ ...prev, isLoading: false }));
      return;
    }

    abortControllerRef.current = new AbortController();
    const controller = abortControllerRef.current;

    const extractColor = async () => {
      try {
        if (controller.signal.aborted) return;
        
        console.log('Extracting color from:', imageUrl.substring(0, 100) + '...');
        const dominantColor = await extractDominantColor(imageUrl);
        
        if (controller.signal.aborted) return;
        
        const { r, g, b } = dominantColor;
        const backgroundColor = `rgb(${r}, ${g}, ${b})`;
        const textColor = getContrastColor(r, g, b);
        const hoverColor = getDarkerShade(r, g, b);
        
        console.log('Color extraction successful:', backgroundColor);
        setColors({
          backgroundColor,
          textColor,
          hoverColor,
          isLoading: false
        });
      } catch (error) {
        if (!controller.signal.aborted) {
          console.log('Color extraction failed, using default colors:', error);
          setColors({
            backgroundColor: 'rgb(59, 130, 246)', // default blue
            textColor: '#ffffff',
            hoverColor: 'rgb(37, 99, 235)',
            isLoading: false
          });
        }
      }
    };

    extractColor();
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [imageUrl]);

  return colors;
};
