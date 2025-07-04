
import React from 'react';

const OptimizedPreloader = () => {
  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-50">
      <div className="relative h-32 w-32 flex items-center justify-center">
        {/* Simple animated logo */}
        <div className="text-6xl animate-bounce">🧺</div>
        
        {/* Simple rotating border */}
        <div className="absolute inset-0 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
      
      {/* Store Name */}
      <div className="mt-8 text-center">
        <h1 className="text-2xl font-bold text-primary mb-2">
          The Food Basket
        </h1>
        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
          <span>Loading</span>
          <div className="flex space-x-1">
            <div className="w-1 h-1 bg-primary rounded-full animate-pulse"></div>
            <div className="w-1 h-1 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-1 h-1 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OptimizedPreloader;
