import React from "react";
import { Link } from "react-router-dom";

const DesktopNavigation = () => {
  return (
    <nav className="hidden md:flex items-center space-x-8">
      <Link 
        to="/" 
        className="text-foreground hover:text-primary transition-colors"
      >
        Home
      </Link>
      <Link 
        to="/shop" 
        className="text-foreground hover:text-primary transition-colors"
      >
        Shop
      </Link>
      <Link 
        to="/food-baskets" 
        className="text-foreground hover:text-primary transition-colors"
      >
        Food Baskets
      </Link>
      <Link 
        to="/auto-replenish" 
        className="text-foreground hover:text-primary transition-colors"
      >
        Auto Replenish
      </Link>
    </nav>
  );
};

export default DesktopNavigation;
