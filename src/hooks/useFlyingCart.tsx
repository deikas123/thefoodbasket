import { useCallback } from 'react';
import { motion } from 'framer-motion';
import { createRoot } from 'react-dom/client';

interface FlyingImageOptions {
  imageUrl: string;
  startX: number;
  startY: number;
  targetSelector: string;
}

const ParticleEffect = ({ x, y }: { x: number; y: number }) => {
  const particles = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    angle: (i * 360) / 8,
    delay: i * 0.02,
  }));

  return (
    <>
      {particles.map((particle) => {
        const radian = (particle.angle * Math.PI) / 180;
        const distance = 40 + Math.random() * 20;
        return (
          <motion.div
            key={particle.id}
            initial={{ 
              x: x, 
              y: y, 
              scale: 1, 
              opacity: 1 
            }}
            animate={{ 
              x: x + Math.cos(radian) * distance,
              y: y + Math.sin(radian) * distance,
              scale: 0,
              opacity: 0 
            }}
            transition={{ 
              duration: 0.5, 
              delay: particle.delay,
              ease: "easeOut"
            }}
            style={{
              position: 'fixed',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.6))',
              boxShadow: '0 0 6px hsl(var(--primary) / 0.5)',
            }}
          />
        );
      })}
    </>
  );
};

export const useFlyingCart = () => {
  const flyToCart = useCallback(({ imageUrl, startX, startY, targetSelector }: FlyingImageOptions) => {
    const cartElement = document.querySelector(targetSelector);
    if (!cartElement) return;

    const cartRect = cartElement.getBoundingClientRect();
    const targetX = cartRect.left + cartRect.width / 2 - 40;
    const targetY = cartRect.top + cartRect.height / 2 - 40;

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

    // Calculate curved trajectory
    const controlX = (startX + targetX) / 2;
    const controlY = Math.min(startY, targetY) - 150;

    const FlyingImage = () => (
      <>
        {/* Main flying product */}
        <motion.div
          initial={{ 
            x: startX, 
            y: startY, 
            scale: 1.1, 
            opacity: 1,
            rotate: 0,
          }}
          animate={{ 
            x: [startX, controlX, targetX],
            y: [startY, controlY, targetY],
            scale: [1.1, 0.9, 0.2],
            opacity: [1, 1, 0],
            rotate: [0, -10, 10],
          }}
          transition={{ 
            duration: 0.7, 
            ease: [0.22, 1, 0.36, 1],
            times: [0, 0.6, 1]
          }}
          onAnimationComplete={() => {
            // Add pulse effect to cart button
            cartElement.classList.add('animate-pulse');
            setTimeout(() => {
              cartElement.classList.remove('animate-pulse');
              root.unmount();
              document.body.removeChild(container);
            }, 300);
          }}
          style={{
            position: 'fixed',
            width: '80px',
            height: '80px',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 8px 32px hsl(var(--primary) / 0.3), 0 4px 16px rgba(0, 0, 0, 0.2)',
            border: '2px solid hsl(var(--primary) / 0.5)',
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
          {/* Glow overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.7, 0] }}
            transition={{ duration: 0.7 }}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(135deg, hsl(var(--primary) / 0.4), hsl(var(--primary) / 0.2))',
              pointerEvents: 'none',
            }}
          />
          {/* Shine effect */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '200%' }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '50%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
              transform: 'skewX(-20deg)',
            }}
          />
        </motion.div>

        {/* Trail particles */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                x: startX + 35, 
                y: startY + 35, 
                scale: 1,
                opacity: 0.8 
              }}
              animate={{ 
                x: [startX + 35, controlX + 35 - i * 15, targetX + 35],
                y: [startY + 35, controlY + 35 + i * 10, targetY + 35],
                scale: [0.8 - i * 0.1, 0.4, 0],
                opacity: [0.6 - i * 0.1, 0.3, 0] 
              }}
              transition={{ 
                duration: 0.7, 
                delay: i * 0.05,
                ease: [0.22, 1, 0.36, 1],
                times: [0, 0.6, 1]
              }}
              style={{
                position: 'fixed',
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: 'hsl(var(--primary))',
                boxShadow: '0 0 10px hsl(var(--primary) / 0.6)',
              }}
            />
          ))}
        </motion.div>

        {/* Burst particles at end */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
        >
          <ParticleEffect x={targetX + 35} y={targetY + 35} />
        </motion.div>
      </>
    );

    root.render(<FlyingImage />);
  }, []);

  return { flyToCart };
};
