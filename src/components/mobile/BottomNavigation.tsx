import React from "react";
import { NavLink } from "react-router-dom";
import { Home, Store, ShoppingBag, User } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const BottomNavigation = () => {
  const { itemCount } = useCart();
  const { user } = useAuth();

  const navItems = [
    {
      label: "Home",
      to: "/",
      icon: Home,
    },
    {
      label: "Shop",
      to: "/shop",
      icon: Store,
    },
    {
      label: "Cart",
      to: "/checkout",
      icon: ShoppingBag,
      badge: itemCount > 0 ? itemCount : undefined,
    },
    {
      label: user ? "Profile" : "Login",
      to: user ? "/profile" : "/login",
      icon: User,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border/50 backdrop-blur-sm md:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 relative",
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground"
              )
            }
          >
            <div className="relative">
              <item.icon className="h-5 w-5" />
              {item.badge && (
                <Badge
                  className="absolute -top-2 -right-2 h-4 w-4 p-0 text-xs flex items-center justify-center"
                  variant="destructive"
                >
                  {item.badge > 99 ? "99+" : item.badge}
                </Badge>
              )}
            </div>
            <span className="text-xs font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNavigation;