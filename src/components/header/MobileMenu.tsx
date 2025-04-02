
import React from "react";
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
} from "lucide-react";

const MobileMenu = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="mr-1">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[250px] sm:w-[300px]">
        <SheetHeader className="mb-6">
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <nav className="space-y-2">
          <Link to="/">
            <Button variant="ghost" className="w-full justify-start">
              Home
            </Button>
          </Link>
          <Link to="/shop">
            <Button variant="ghost" className="w-full justify-start">
              Shop
            </Button>
          </Link>
          <Link to="/food-baskets">
            <Button variant="ghost" className="w-full justify-start">
              Food Baskets
            </Button>
          </Link>
          <Separator className="my-4" />
          
          {user ? (
            <>
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">My Account</p>
              </div>
              <Link to="/profile">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm"
                >
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Button>
              </Link>
              <Link to="/orders">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm"
                >
                  <Package className="mr-2 h-4 w-4" />
                  Orders
                </Button>
              </Link>
              <Link to="/wishlist">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm"
                >
                  <Heart className="mr-2 h-4 w-4" />
                  Wishlist
                </Button>
              </Link>
              <Link to="/wallet">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm"
                >
                  <Wallet className="mr-2 h-4 w-4" />
                  Wallet
                </Button>
              </Link>
              <Link to="/pay-later">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm"
                >
                  <Clock className="mr-2 h-4 w-4" />
                  Pay Later
                </Button>
              </Link>
              <Link to="/auto-replenish">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm"
                >
                  <CalendarClock className="mr-2 h-4 w-4" />
                  Auto Replenish
                </Button>
              </Link>
              <Button
                variant="ghost"
                className="w-full justify-start text-sm"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button
                  variant="default"
                  className="w-full justify-center"
                >
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button
                  variant="outline"
                  className="w-full justify-center"
                >
                  Create Account
                </Button>
              </Link>
            </>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
};

export default MobileMenu;
