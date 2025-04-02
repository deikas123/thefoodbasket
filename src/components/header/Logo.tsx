
import React from "react";
import { Link } from "react-router-dom";

const Logo = () => {
  return (
    <Link to="/" className="flex items-center gap-2">
      <div className="relative h-8 w-8 md:h-10 md:w-10 flex items-center justify-center">
        <span className="text-2xl md:text-3xl">🧺</span>
      </div>
      <span className="hidden sm:block text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent transition-all">
        The Food Basket
      </span>
    </Link>
  );
};

export default Logo;
