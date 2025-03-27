
import React, { useEffect, useState } from 'react';
import { ShoppingCart, Apple, Carrot, Milk, Banana, Egg } from 'lucide-react';

interface GroceryItemProps {
  Icon: React.ElementType;
  delay: number;
  top: number;
  left: number;
}

const GroceryItem = ({ Icon, delay, top, left }: GroceryItemProps) => {
  return (
    <div 
      className="absolute text-primary animate-bounce"
      style={{ 
        top: `${top}%`, 
        left: `${left}%`,
        animationDelay: `${delay}s`,
        animationDuration: '1s',
        opacity: 0,
        animation: `fall 1.5s ease-in ${delay}s forwards, bounce 0.5s ease-in-out ${delay + 1.5}s`
      }}
    >
      <Icon size={32} />
    </div>
  );
};

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
    <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
      <div className="relative h-64 w-64">
        {/* Cart */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-primary animate-pulse">
          <ShoppingCart size={80} strokeWidth={1.5} />
        </div>
        
        {/* Groceries */}
        <GroceryItem Icon={Apple} delay={0.5} top={-10} left={30} />
        <GroceryItem Icon={Carrot} delay={1.2} top={-10} left={50} />
        <GroceryItem Icon={Milk} delay={1.8} top={-10} left={70} />
        <GroceryItem Icon={Banana} delay={2.5} top={-10} left={20} />
        <GroceryItem Icon={Egg} delay={3.0} top={-10} left={60} />
        
        {/* Logo */}
        <div className="absolute top-[-80px] left-1/2 transform -translate-x-1/2 text-2xl font-semibold text-primary flex items-center gap-2">
          <span className="text-3xl">🧺</span>
          <span>The Food Basket</span>
        </div>
        
        {/* Loading text */}
        <div className="absolute bottom-[-50px] left-1/2 transform -translate-x-1/2 text-muted-foreground">
          Loading your groceries...
        </div>
      </div>
    </div>
  );
};

export default Preloader;
