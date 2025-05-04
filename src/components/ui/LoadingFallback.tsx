
import React from 'react';

interface LoadingFallbackProps {
  minHeight?: string;
  size?: 'small' | 'medium' | 'large';
}

const LoadingFallback: React.FC<LoadingFallbackProps> = ({ 
  minHeight = '60vh',
  size = 'medium'
}) => {
  const sizeMap = {
    small: 'h-6 w-6',
    medium: 'h-12 w-12',
    large: 'h-16 w-16'
  };

  return (
    <div className={`flex items-center justify-center min-h-[${minHeight}]`}>
      <div className={`animate-spin rounded-full ${sizeMap[size]} border-t-2 border-b-2 border-primary`}></div>
    </div>
  );
};

export default LoadingFallback;
