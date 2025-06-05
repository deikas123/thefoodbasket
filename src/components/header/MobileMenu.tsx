import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Home, ShoppingBag, Package, Menu, Clock, RotateCcw, User, LogOut, LogIn, Star } from "lucide-react";

const MobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setIsOpen(true)}
      >
        <Menu className="h-6 w-6" />
        <span className="sr-only">Open menu</span>
      </Button>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="left" className="w-80">
          <div className="flex flex-col h-full">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            
            <nav className="flex-1 py-6">
              <div className="space-y-2">
                <Link
                  to="/"
                  className="flex items-center px-3 py-2 rounded-md hover:bg-accent transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <Home className="h-5 w-5 mr-3" />
                  Home
                </Link>
                <Link
                  to="/shop"
                  className="flex items-center px-3 py-2 rounded-md hover:bg-accent transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <ShoppingBag className="h-5 w-5 mr-3" />
                  Shop
                </Link>
                <Link
                  to="/food-baskets"
                  className="flex items-center px-3 py-2 rounded-md hover:bg-accent transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <Package className="h-5 w-5 mr-3" />
                  Food Baskets
                </Link>
                <Link
                  to="/timer"
                  className="flex items-center px-3 py-2 rounded-md hover:bg-accent transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <Clock className="h-5 w-5 mr-3" />
                  Timer
                </Link>
                <Link
                  to="/auto-replenish"
                  className="flex items-center px-3 py-2 rounded-md hover:bg-accent transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <RotateCcw className="h-5 w-5 mr-3" />
                  Auto Replenish
                </Link>

                {isAuthenticated ? (
                  <>
                    <Link
                      to="/profile"
                      className="flex items-center px-3 py-2 rounded-md hover:bg-accent transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <User className="h-5 w-5 mr-3" />
                      Profile
                    </Link>
                    <Link
                      to="/wishlist"
                      className="flex items-center px-3 py-2 rounded-md hover:bg-accent transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <Star className="h-5 w-5 mr-3" />
                      Wishlist
                    </Link>
                    <Button
                      variant="ghost"
                      className="flex items-center justify-start w-full px-3 py-2 rounded-md hover:bg-accent transition-colors"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-5 w-5 mr-3" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="flex items-center px-3 py-2 rounded-md hover:bg-accent transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <LogIn className="h-5 w-5 mr-3" />
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="flex items-center px-3 py-2 rounded-md hover:bg-accent transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <User className="h-5 w-5 mr-3" />
                      Register
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default MobileMenu;
