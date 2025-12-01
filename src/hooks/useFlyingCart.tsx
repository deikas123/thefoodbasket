import { useCallback } from 'react';
import { motion } from 'framer-motion';
import { createRoot } from 'react-dom/client';

interface FlyingImageOptions {
  imageUrl: string;
  startX: number;
  startY: number;
  targetSelector: string;
}

export const useFlyingCart = () => {
  const flyToCart = useCallback(({ imageUrl, startX, startY, targetSelector }: FlyingImageOptions) => {
    // Get cart button position
    const cartElement = document.querySelector(targetSelector);
    if (!cartElement) return;

    const cartRect = cartElement.getBoundingClientRect();
    const targetX = cartRect.left + cartRect.width / 2;
    const targetY = cartRect.top + cartRect.height / 2;

    // Create container for animation
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100vw';
    container.style.height = '100vh';
    container.style.pointerEvents = 'none';
    container.style.zIndex = '9999';
    document.body.appendChild(container);

    const root = createRoot(container);

    // Calculate trajectory with curve
    const controlX = (startX + targetX) / 2;
    const controlY = Math.min(startY, targetY) - 100;

    const FlyingImage = () => (
      <motion.div
        initial={{ 
          x: startX, 
          y: startY, 
          scale: 1, 
          opacity: 1 
        }}
        animate={{ 
          x: [startX, controlX, targetX],
          y: [startY, controlY, targetY],
          scale: [1, 0.8, 0.3],
          opacity: [1, 1, 0]
        }}
        transition={{ 
          duration: 0.8, 
          ease: [0.34, 1.56, 0.64, 1],
          times: [0, 0.5, 1]
        }}
        style={{
          position: 'fixed',
          width: '80px',
          height: '80px',
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        }}
        onAnimationComplete={() => {
          setTimeout(() => {
            root.unmount();
            document.body.removeChild(container);
          }, 100);
        }}
      >
        <img
          src={imageUrl}
          alt="Flying product"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
        {/* Trail effect */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.6, 0] }}
          transition={{ duration: 0.8 }}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(45deg, rgba(59, 130, 246, 0.4), rgba(147, 51, 234, 0.4))',
            filter: 'blur(8px)',
            transform: 'translateX(-20px)',
          }}
        />
      </motion.div>
    );

    root.render(<FlyingImage />);
  }, []);

  return { flyToCart };
};
