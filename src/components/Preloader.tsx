
import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Apple, Carrot, Milk, Egg, ShoppingCart, Leaf, Heart, Zap, Star } from 'lucide-react';

const foodFacts = [
  { icon: Apple, text: "🍎 An apple a day keeps the doctor away — stock up on fresh fruits!", color: "text-red-500" },
  { icon: Carrot, text: "🥕 Carrots are 88% water — great for staying hydrated!", color: "text-orange-500" },
  { icon: Leaf, text: "🥬 Eating leafy greens daily can boost your immune system", color: "text-green-500" },
  { icon: Heart, text: "❤️ Avocados contain heart-healthy monounsaturated fats", color: "text-pink-500" },
  { icon: Zap, text: "⚡ Bananas are a natural energy booster — perfect pre-workout snack!", color: "text-yellow-500" },
  { icon: Star, text: "🌟 Free delivery on orders over KSh 2,000 this week!", color: "text-primary" },
  { icon: Milk, text: "🥛 Calcium-rich foods strengthen bones — try our fresh milk range!", color: "text-blue-400" },
  { icon: Egg, text: "🥚 Eggs are a complete protein source with all 9 essential amino acids", color: "text-amber-500" },
  { icon: ShoppingCart, text: "🛒 Rally Season Sale — up to 30% off on fresh groceries!", color: "text-primary" },
  { icon: Leaf, text: "🌿 Locally sourced produce reduces carbon footprint by up to 50%", color: "text-emerald-500" },
];

const Preloader = () => {
  const [loading, setLoading] = useState(true);
  const [factIndex, setFactIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  // Shuffle facts on mount
  const shuffledFacts = useMemo(() => {
    return [...foodFacts].sort(() => Math.random() - 0.5);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 4500);
    return () => clearTimeout(timer);
  }, []);

  // Rotate facts every 1.8s
  useEffect(() => {
    const interval = setInterval(() => {
      setFactIndex(prev => (prev + 1) % shuffledFacts.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [shuffledFacts.length]);

  // Progress bar
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 100;
        return prev + 2.5;
      });
    }, 100);
    return () => clearInterval(interval);
  }, []);

  if (!loading) return null;

  const currentFact = shuffledFacts[factIndex];

  return (
    <motion.div 
      className="fixed inset-0 bg-background flex flex-col items-center justify-center z-50"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative h-52 w-52 flex items-center justify-center">
        {/* Logo */}
        <motion.div
          className="absolute text-primary text-4xl"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          🧺
        </motion.div>
        
        {/* Circular Track */}
        <motion.div
          className="absolute w-40 h-40 rounded-full border-2 border-primary/20"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        />
        
        {/* Orbiting items */}
        {[
          { Icon: Apple, delay: 0, position: "top-0 left-[calc(50%-14px)]" },
          { Icon: Carrot, delay: 1.5, position: "right-0 top-[calc(50%-14px)]" },
          { Icon: Milk, delay: 3, position: "bottom-0 left-[calc(50%-14px)]" },
          { Icon: Egg, delay: 4.5, position: "left-0 top-[calc(50%-14px)]" },
        ].map(({ Icon, delay, position }, i) => (
          <motion.div 
            key={i}
            className="absolute w-40 h-40"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 7, ease: "linear", delay }}
          >
            <motion.div
              className={`absolute ${position} text-primary bg-background p-1 rounded-full`}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + i * 0.15, type: "spring" }}
            >
              <Icon size={28} strokeWidth={1.5} />
            </motion.div>
          </motion.div>
        ))}

        {/* Bouncing cart */}
        <motion.div
          className="absolute -bottom-12 text-primary"
          initial={{ x: '-100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 1.2, type: 'spring', stiffness: 120 }}
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ delay: 2, duration: 0.8, repeat: Infinity, repeatDelay: 1.2 }}
          >
            <ShoppingCart size={36} strokeWidth={1.5} />
          </motion.div>
        </motion.div>
      </div>
      
      {/* Store Name */}
      <motion.div 
        className="mt-14 text-center px-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.6 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent mb-3">
          The Food Basket
        </h1>
        
        {/* Progress bar */}
        <div className="w-48 mx-auto h-1.5 bg-muted rounded-full overflow-hidden mb-5">
          <motion.div 
            className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
            style={{ width: `${Math.min(progress, 100)}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>

        {/* Rotating food facts */}
        <div className="h-14 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={factIndex}
              className="text-muted-foreground text-xs md:text-sm max-w-xs leading-relaxed"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              {currentFact.text}
            </motion.p>
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Preloader;
