
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Apple, Carrot, Milk, Egg, ShoppingCart } from 'lucide-react';

const Preloader = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time - in a real app, this would be tied to actual loading status
    const timer = setTimeout(() => {
      setLoading(false);
    }, 5000); // 5 seconds for the animation to play
    
    return () => clearTimeout(timer);
  }, []);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-50">
      <div className="relative h-64 w-64 flex items-center justify-center">
        {/* Logo */}
        <motion.div
          className="absolute text-primary text-4xl mb-4"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1 }}
        >
          🧺
        </motion.div>
        
        {/* Circular Track */}
        <motion.div
          className="absolute w-48 h-48 rounded-full border-2 border-primary/20"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.7 }}
        />
        
        {/* Orbit Items */}
        <motion.div 
          className="absolute w-48 h-48"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
        >
          <motion.div
            className="absolute top-0 left-[calc(50%-16px)] text-primary bg-background p-1 rounded-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <Apple size={32} strokeWidth={1.5} />
          </motion.div>
        </motion.div>
        
        <motion.div 
          className="absolute w-48 h-48"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 8, ease: "linear", delay: 1.6 }}
        >
          <motion.div
            className="absolute right-0 top-[calc(50%-16px)] text-primary bg-background p-1 rounded-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <Carrot size={32} strokeWidth={1.5} />
          </motion.div>
        </motion.div>
        
        <motion.div 
          className="absolute w-48 h-48"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 8, ease: "linear", delay: 3.2 }}
        >
          <motion.div
            className="absolute bottom-0 left-[calc(50%-16px)] text-primary bg-background p-1 rounded-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
          >
            <Milk size={32} strokeWidth={1.5} />
          </motion.div>
        </motion.div>
        
        <motion.div 
          className="absolute w-48 h-48"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 8, ease: "linear", delay: 4.8 }}
        >
          <motion.div
            className="absolute left-0 top-[calc(50%-16px)] text-primary bg-background p-1 rounded-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
          >
            <Egg size={32} strokeWidth={1.5} />
          </motion.div>
        </motion.div>
        
        {/* Shopping cart jumping in at the end */}
        <motion.div
          className="absolute bottom-[-60px] text-primary"
          initial={{ x: '-100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 2, type: 'spring', stiffness: 100, duration: 1 }}
        >
          <motion.div
            animate={{ y: [0, -15, 0] }}
            transition={{ delay: 3, duration: 1, repeat: Infinity, repeatDelay: 1 }}
          >
            <ShoppingCart size={40} strokeWidth={1.5} />
          </motion.div>
        </motion.div>
      </div>
      
      {/* Store Name */}
      <motion.div 
        className="mt-16 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5, duration: 0.8 }}
      >
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent mb-2">
          The Food Basket
        </h1>
        <p className="text-muted-foreground text-sm animate-pulse">
          Loading your fresh groceries...
        </p>
      </motion.div>
    </div>
  );
};

export default Preloader;
