import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "./ui/button";

interface NewYearFireworksProps {
  onClose?: () => void;
}

const NewYearFireworks = ({ onClose }: NewYearFireworksProps) => {
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    color: string;
    size: number;
    delay: number;
  }>>([]);

  useEffect(() => {
    const colors = ["#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD", "#98D8C8"];
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 60 + 10,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 4,
      delay: Math.random() * 2
    }));
    setParticles(newParticles);
  }, []);

  const handleClose = () => {
    if (onClose) onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 pointer-events-none overflow-hidden"
    >
      {/* Close button */}
      <div className="pointer-events-auto absolute top-4 right-4 z-[60]">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClose}
          className="bg-background/80 hover:bg-background text-foreground rounded-full backdrop-blur-sm"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Firework particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: [0, 1.5, 1, 0],
            opacity: [0, 1, 1, 0],
            y: [0, -30, 20, 50],
          }}
          transition={{
            duration: 2.5,
            delay: particle.delay,
            repeat: Infinity,
            repeatDelay: 1,
          }}
        />
      ))}

      {/* New Year Banner */}
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
        className="absolute top-1/4 left-1/2 transform -translate-x-1/2 text-center pointer-events-none"
      >
        <motion.h1
          className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 bg-clip-text text-transparent drop-shadow-lg"
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        >
          🎆 Happy New Year 2026! 🎆
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-xl md:text-2xl text-white mt-4 drop-shadow-md"
        >
          Wishing you joy and prosperity!
        </motion.p>
      </motion.div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/30 pointer-events-none" />
    </motion.div>
  );
};

export default NewYearFireworks;