
import { useState, useEffect } from 'react';
import { extractDominantColor, getContrastColor, getDarkerShade } from '@/utils/colorExtractor';

interface DynamicColorResult {
  backgroundColor: string;
  textColor: string;
  hoverColor: string;
  isLoading: boolean;
}

export const useDynamicColor = (imageUrl: string): DynamicColorResult => {
  const [colors, setColors] = useState<DynamicColorResult>({
    backgroundColor: 'rgb(239, 68, 68)', // default red
    textColor: '#ffffff',
    hoverColor: 'rgb(220, 38, 38)',
    isLoading: true
  });

  useEffect(() => {
    if (!imageUrl || imageUrl === '/placeholder.svg') {
      setColors(prev => ({ ...prev, isLoading: false }));
      return;
    }

    const extractColor = async () => {
      try {
        const dominantColor = await extractDominantColor(imageUrl);
        const { r, g, b } = dominantColor;
        
        const backgroundColor = `rgb(${r}, ${g}, ${b})`;
        const textColor = getContrastColor(r, g, b);
        const hoverColor = getDarkerShade(r, g, b);
        
        setColors({
          backgroundColor,
          textColor,
          hoverColor,
          isLoading: false
        });
      } catch (error) {
        console.log('Failed to extract color from image:', error);
        setColors(prev => ({ ...prev, isLoading: false }));
      }
    };

    extractColor();
  }, [imageUrl]);

  return colors;
};
