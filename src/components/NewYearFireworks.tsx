import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Firework {
  id: number;
  x: number;
  y: number;
  color: string;
  particles: Particle[];
}

interface Particle {
  id: number;
  angle: number;
  distance: number;
  color: string;
  size: number;
}

const COLORS = [
  "hsl(var(--primary))",
  "#FFD700", // Gold
  "#FF6B6B", // Coral
  "#4ECDC4", // Teal
  "#A855F7", // Purple
  "#F59E0B", // Amber
  "#10B981", // Emerald
  "#EC4899", // Pink
];

const generateParticles = (color: string): Particle[] => {
  const count = 12 + Math.floor(Math.random() * 8);
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    angle: (360 / count) * i + Math.random() * 20,
    distance: 60 + Math.random() * 80,
    color: Math.random() > 0.3 ? color : COLORS[Math.floor(Math.random() * COLORS.length)],
    size: 3 + Math.random() * 4,
  }));
};

const NewYearFireworks = () => {
  const [fireworks, setFireworks] = useState<Firework[]>([]);
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    // Launch fireworks periodically
    const launchFirework = () => {
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      const newFirework: Firework = {
        id: Date.now() + Math.random(),
        x: 10 + Math.random() * 80,
        y: 10 + Math.random() * 40,
        color,
        particles: generateParticles(color),
      };
      
      setFireworks(prev => [...prev, newFirework]);
      
      // Remove firework after animation
      setTimeout(() => {
        setFireworks(prev => prev.filter(f => f.id !== newFirework.id));
      }, 2000);
    };

    // Initial burst of fireworks
    for (let i = 0; i < 3; i++) {
      setTimeout(launchFirework, i * 300);
    }

    // Continue launching fireworks
    const interval = setInterval(launchFirework, 800);
    
    // Hide banner after 10 seconds
    const bannerTimeout = setTimeout(() => setShowBanner(false), 10000);
    
    // Stop fireworks after 15 seconds
    const stopTimeout = setTimeout(() => {
      clearInterval(interval);
    }, 15000);

    return () => {
      clearInterval(interval);
      clearTimeout(bannerTimeout);
      clearTimeout(stopTimeout);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {/* Fireworks */}
      <AnimatePresence>
        {fireworks.map(firework => (
          <div
            key={firework.id}
            className="absolute"
            style={{
              left: `${firework.x}%`,
              top: `${firework.y}%`,
            }}
          >
            {/* Center flash */}
            <motion.div
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute w-4 h-4 rounded-full"
              style={{
                backgroundColor: firework.color,
                boxShadow: `0 0 20px ${firework.color}, 0 0 40px ${firework.color}`,
                transform: "translate(-50%, -50%)",
              }}
            />
            
            {/* Particles */}
            {firework.particles.map(particle => (
              <motion.div
                key={particle.id}
                initial={{ 
                  x: 0, 
                  y: 0, 
                  opacity: 1, 
                  scale: 1 
                }}
                animate={{ 
                  x: Math.cos((particle.angle * Math.PI) / 180) * particle.distance,
                  y: Math.sin((particle.angle * Math.PI) / 180) * particle.distance + 30,
                  opacity: 0,
                  scale: 0.3,
                }}
                transition={{ 
                  duration: 1.2 + Math.random() * 0.5,
                  ease: "easeOut"
                }}
                className="absolute rounded-full"
                style={{
                  width: particle.size,
                  height: particle.size,
                  backgroundColor: particle.color,
                  boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
                  transform: "translate(-50%, -50%)",
                }}
              />
            ))}
            
            {/* Trailing sparkles */}
            {firework.particles.slice(0, 6).map(particle => (
              <motion.div
                key={`trail-${particle.id}`}
                initial={{ 
                  x: 0, 
                  y: 0, 
                  opacity: 0.8, 
                  scale: 0.5 
                }}
                animate={{ 
                  x: Math.cos((particle.angle * Math.PI) / 180) * (particle.distance * 0.7),
                  y: Math.sin((particle.angle * Math.PI) / 180) * (particle.distance * 0.7) + 50,
                  opacity: 0,
                  scale: 0,
                }}
                transition={{ 
                  duration: 1.5,
                  ease: "easeOut",
                  delay: 0.2
                }}
                className="absolute rounded-full"
                style={{
                  width: 2,
                  height: 2,
                  backgroundColor: "#FFD700",
                  boxShadow: "0 0 4px #FFD700",
                  transform: "translate(-50%, -50%)",
                }}
              />
            ))}
          </div>
        ))}
      </AnimatePresence>

      {/* New Year Banner */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.9 }}
            transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
            className="absolute top-20 left-1/2 -translate-x-1/2 text-center pointer-events-auto"
          >
            <motion.div
              animate={{ 
                textShadow: [
                  "0 0 20px rgba(255,215,0,0.5)",
                  "0 0 40px rgba(255,215,0,0.8)",
                  "0 0 20px rgba(255,215,0,0.5)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-4xl md:text-6xl font-bold"
              style={{
                background: "linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              🎆 Happy New Year 2026! 🎇
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-lg md:text-xl text-foreground/80 mt-2"
            >
              Wishing you prosperity and joy! 🥂
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decorative stars */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: [0, 1, 0],
            scale: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 3
          }}
          className="absolute text-yellow-300"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 60}%`,
            fontSize: `${8 + Math.random() * 12}px`
          }}
        >
          ✦
        </motion.div>
      ))}
    </div>
  );
};

export default NewYearFireworks;