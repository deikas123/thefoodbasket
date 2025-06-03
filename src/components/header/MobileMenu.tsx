
import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import {
  User,
  Package,
  Heart,
  Wallet,
  Clock,
  CalendarClock,
  LogOut,
  Menu,
  Home,
  ShoppingBag,
  ShoppingBasket,
  Settings,
  Bell,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

const MobileMenu = () => {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setOpen(false);
  };

  const handleLinkClick = () => {
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Menu className="h-4 w-4" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] p-0">
        <div className="flex flex-col h-full">
          <SheetHeader className="p-6 pb-4 border-b">
            <SheetTitle className="text-left">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🧺</span>
                <span className="font-bold">The Food Basket</span>
              </div>
            </SheetTitle>
          </SheetHeader>
          
          <div className="flex-1 overflow-y-auto">
            {/* Main Navigation */}
            <nav className="p-4 space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">Navigation</h3>
              
              <Link to="/" onClick={handleLinkClick}>
                <Button variant="ghost" className="w-full justify-start h-11">
                  <Home className="mr-3 h-4 w-4" />
                  Home
                </Button>
              </Link>
              
              <Link to="/shop" onClick={handleLinkClick}>
                <Button variant="ghost" className="w-full justify-start h-11">
                  <ShoppingBasket className="mr-3 h-4 w-4" />
                  Shop
                </Button>
              </Link>
              
              <Link to="/food-baskets" onClick={handleLinkClick}>
                <Button variant="ghost" className="w-full justify-start h-11">
                  <ShoppingBag className="mr-3 h-4 w-4" />
                  Food Baskets
                </Button>
              </Link>
              
              <Link to="/auto-replenish" onClick={handleLinkClick}>
                <Button variant="ghost" className="w-full justify-start h-11">
                  <CalendarClock className="mr-3 h-4 w-4" />
                  Auto Replenish
                </Button>
              </Link>
            </nav>
            
            <Separator className="mx-4" />
            
            {user ? (
              <nav className="p-4 space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                  My Account
                  {user.role === "admin" && (
                    <Badge variant="outline" className="text-xs">Admin</Badge>
                  )}
                </h3>
                
                <Link to="/profile" onClick={handleLinkClick}>
                  <Button variant="ghost" className="w-full justify-start h-11">
                    <User className="mr-3 h-4 w-4" />
                    Profile
                  </Button>
                </Link>
                
                <Link to="/orders" onClick={handleLinkClick}>
                  <Button variant="ghost" className="w-full justify-start h-11">
                    <Package className="mr-3 h-4 w-4" />
                    Orders
                  </Button>
                </Link>
                
                <Link to="/wishlist" onClick={handleLinkClick}>
                  <Button variant="ghost" className="w-full justify-start h-11">
                    <Heart className="mr-3 h-4 w-4" />
                    Wishlist
                  </Button>
                </Link>
                
                <Link to="/wallet" onClick={handleLinkClick}>
                  <Button variant="ghost" className="w-full justify-start h-11">
                    <Wallet className="mr-3 h-4 w-4" />
                    Wallet
                  </Button>
                </Link>
                
                <Link to="/pay-later" onClick={handleLinkClick}>
                  <Button variant="ghost" className="w-full justify-start h-11">
                    <Clock className="mr-3 h-4 w-4" />
                    Pay Later
                  </Button>
                </Link>
                
                <Link to="/notifications" onClick={handleLinkClick}>
                  <Button variant="ghost" className="w-full justify-start h-11">
                    <Bell className="mr-3 h-4 w-4" />
                    Notifications
                  </Button>
                </Link>
                
                {user.role === "admin" && (
                  <Link to="/admin" onClick={handleLinkClick}>
                    <Button variant="ghost" className="w-full justify-start h-11">
                      <Settings className="mr-3 h-4 w-4" />
                      Admin Dashboard
                    </Button>
                  </Link>
                )}
              </nav>
            ) : (
              <div className="p-4 space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">Account</h3>
                
                <Link to="/login" onClick={handleLinkClick}>
                  <Button className="w-full h-11">
                    Sign In
                  </Button>
                </Link>
                
                <Link to="/register" onClick={handleLinkClick}>
                  <Button variant="outline" className="w-full h-11">
                    Create Account
                  </Button>
                </Link>
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="p-4 border-t mt-auto">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Theme</span>
              <ThemeToggle />
            </div>
            
            {user && (
              <Button
                variant="ghost"
                className="w-full justify-start h-11 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={handleLogout}
              >
                <LogOut className="mr-3 h-4 w-4" />
                Log out
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileMenu;
