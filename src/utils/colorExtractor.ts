
interface ColorResult {
  r: number;
  g: number;
  b: number;
}

export const extractDominantColor = async (imageUrl: string): Promise<ColorResult> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        // Resize for faster processing
        const size = 50;
        canvas.width = size;
        canvas.height = size;
        
        ctx.drawImage(img, 0, 0, size, size);
        const imageData = ctx.getImageData(0, 0, size, size);
        const data = imageData.data;
        
        // Extract colors and find dominant one
        const colorCounts: { [key: string]: number } = {};
        
        for (let i = 0; i < data.length; i += 4) {
          const r = Math.floor(data[i] / 32) * 32;
          const g = Math.floor(data[i + 1] / 32) * 32;
          const b = Math.floor(data[i + 2] / 32) * 32;
          
          // Skip very light or very dark colors
          const brightness = (r + g + b) / 3;
          if (brightness < 50 || brightness > 200) continue;
          
          const colorKey = `${r},${g},${b}`;
          colorCounts[colorKey] = (colorCounts[colorKey] || 0) + 1;
        }
        
        // Find most frequent color
        let dominantColor = '128,128,128'; // default gray
        let maxCount = 0;
        
        for (const [color, count] of Object.entries(colorCounts)) {
          if (count > maxCount) {
            maxCount = count;
            dominantColor = color;
          }
        }
        
        const [r, g, b] = dominantColor.split(',').map(Number);
        resolve({ r, g, b });
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    img.src = imageUrl;
  });
};

export const getContrastColor = (r: number, g: number, b: number): string => {
  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#ffffff';
};

export const getDarkerShade = (r: number, g: number, b: number): string => {
  const factor = 0.8;
  return `rgb(${Math.floor(r * factor)}, ${Math.floor(g * factor)}, ${Math.floor(b * factor)})`;
};
