
interface ColorResult {
  r: number;
  g: number;
  b: number;
}

export const extractDominantColor = async (imageUrl: string): Promise<ColorResult> => {
  return new Promise((resolve) => {
    const img = new Image();
    
    // Handle different image sources
    if (imageUrl.startsWith('http') && !imageUrl.includes(window.location.hostname)) {
      img.crossOrigin = 'anonymous';
    }
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          resolve({ r: 59, g: 130, b: 246 }); // Default blue
          return;
        }
        
        // Use smaller canvas for better performance
        const size = 32;
        canvas.width = size;
        canvas.height = size;
        
        ctx.drawImage(img, 0, 0, size, size);
        const imageData = ctx.getImageData(0, 0, size, size);
        const data = imageData.data;
        
        // Color frequency map
        const colorMap = new Map<string, number>();
        
        // Sample every 4th pixel for performance
        for (let i = 0; i < data.length; i += 16) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const alpha = data[i + 3];
          
          // Skip transparent pixels
          if (alpha < 128) continue;
          
          // Reduce color space to group similar colors
          const reducedR = Math.floor(r / 16) * 16;
          const reducedG = Math.floor(g / 16) * 16;
          const reducedB = Math.floor(b / 16) * 16;
          
          // Skip very light, very dark, or very gray colors
          const brightness = (reducedR + reducedG + reducedB) / 3;
          const saturation = Math.max(reducedR, reducedG, reducedB) - Math.min(reducedR, reducedG, reducedB);
          
          if (brightness < 40 || brightness > 220 || saturation < 30) continue;
          
          const colorKey = `${reducedR},${reducedG},${reducedB}`;
          colorMap.set(colorKey, (colorMap.get(colorKey) || 0) + 1);
        }
        
        if (colorMap.size === 0) {
          resolve({ r: 59, g: 130, b: 246 }); // Default blue
          return;
        }
        
        // Find the most frequent color
        let dominantColor = '59,130,246';
        let maxCount = 0;
        
        for (const [color, count] of colorMap.entries()) {
          if (count > maxCount) {
            maxCount = count;
            dominantColor = color;
          }
        }
        
        const [r, g, b] = dominantColor.split(',').map(Number);
        
        // Ensure the color is vibrant enough
        const vibrantR = Math.max(r, 80);
        const vibrantG = Math.max(g, 80);
        const vibrantB = Math.max(b, 80);
        
        resolve({ r: vibrantR, g: vibrantG, b: vibrantB });
      } catch (error) {
        console.log('Canvas extraction failed:', error);
        resolve({ r: 59, g: 130, b: 246 }); // Default blue
      }
    };
    
    img.onerror = () => {
      console.log('Image load failed, using default color');
      resolve({ r: 59, g: 130, b: 246 }); // Default blue
    };
    
    // Add timeout to prevent hanging
    setTimeout(() => {
      if (!img.complete) {
        console.log('Image load timeout, using default color');
        resolve({ r: 59, g: 130, b: 246 }); // Default blue
      }
    }, 5000);
    
    img.src = imageUrl;
  });
};

export const getContrastColor = (r: number, g: number, b: number): string => {
  // Use WCAG contrast ratio calculation
  const luminance = (0.2126 * (r / 255) + 0.7152 * (g / 255) + 0.0722 * (b / 255));
  return luminance > 0.6 ? '#000000' : '#ffffff';
};

export const getDarkerShade = (r: number, g: number, b: number): string => {
  const factor = 0.7;
  return `rgb(${Math.floor(r * factor)}, ${Math.floor(g * factor)}, ${Math.floor(b * factor)})`;
};
