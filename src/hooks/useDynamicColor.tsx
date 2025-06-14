
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
    backgroundColor: 'rgb(99, 102, 241)', // default indigo
    textColor: '#ffffff',
    hoverColor: 'rgb(79, 70, 229)',
    isLoading: true
  });

  useEffect(() => {
    if (!imageUrl || imageUrl === '/placeholder.svg' || imageUrl.includes('placeholder')) {
      setColors(prev => ({ ...prev, isLoading: false }));
      return;
    }

    const extractColor = async () => {
      try {
        console.log('Extracting color from:', imageUrl);
        const dominantColor = await extractDominantColor(imageUrl);
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
        console.log('Color extraction failed, using default colors:', error);
        setColors({
          backgroundColor: 'rgb(99, 102, 241)', // default indigo
          textColor: '#ffffff',
          hoverColor: 'rgb(79, 70, 229)',
          isLoading: false
        });
      }
    };

    extractColor();
  }, [imageUrl]);

  return colors;
};
