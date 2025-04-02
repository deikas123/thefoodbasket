
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";

const Logo = () => {
  const { user } = useAuth();
  const isAdmin = user && user.role === "admin";

  return (
    <div className="flex items-center">
      <Link to="/" className="flex items-center gap-2">
        <div className="relative h-8 w-8 md:h-10 md:w-10 flex items-center justify-center">
          <span className="text-2xl md:text-3xl">🧺</span>
        </div>
        <span className="hidden sm:block text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent transition-all">
          The Food Basket
        </span>
      </Link>
      
      {isAdmin && (
        <Link to="/admin" className="ml-3">
          <Badge variant="outline" className="bg-amber-100 hover:bg-amber-200 text-amber-800 border-amber-300">
            Admin
          </Badge>
        </Link>
      )}
    </div>
  );
};

export default Logo;
