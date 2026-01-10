import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/types";
import { ShoppingBasket } from "lucide-react";

const Logo = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const isAdmin = user && user.role === "admin";

  return (
    <div className="flex items-center gap-2">
      <Link to="/" className="flex items-center gap-2">
        <div className="relative flex items-center justify-center bg-primary rounded-xl p-1.5 md:p-2">
          <ShoppingBasket className="h-5 w-5 md:h-6 md:w-6 text-primary-foreground" />
        </div>
        {!isMobile && (
          <span className="font-bold text-lg text-foreground">
            FoodBasket
          </span>
        )}
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
