
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/types";

const Logo = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const isAdmin = user && user.role === "admin";

  return (
    <div className="flex items-center gap-2">
      <Link to="/" className="flex items-center gap-2">
        <div className="relative h-8 w-8 md:h-10 md:w-10 flex items-center justify-center">
          <span className="text-2xl md:text-3xl">🧺</span>
        </div>
        <span className={cn(
          "font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent transition-all",
          isMobile ? "text-lg" : "text-xl md:text-2xl"
        )}>
          {isMobile ? "Food Basket" : "The Food Basket"}
        </span>
      </Link>
      
      {isAdmin && !isMobile && (
        <Link to="/admin">
          <Badge variant="outline" className="bg-amber-100 hover:bg-amber-200 text-amber-800 border-amber-300 text-xs">
            Admin
          </Badge>
        </Link>
      )}
    </div>
  );
};

export default Logo;
