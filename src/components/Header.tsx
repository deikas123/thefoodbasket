
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/types";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Heart } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

// Import new components
import Logo from "@/components/header/Logo";
import MobileMenu from "@/components/header/MobileMenu";
import DesktopNavigation from "@/components/header/DesktopNavigation";
import EnhancedSearchBar from "@/components/header/EnhancedSearchBar";
import UserMenu from "@/components/header/UserMenu";
import NotificationsMenu from "@/components/header/NotificationsMenu";
import CartButton from "@/components/header/CartButton";
import LoyaltyPointsBadge from "@/components/header/LoyaltyPointsBadge";

const Header = () => {
  const isMobile = useIsMobile();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { itemCount } = useWishlist();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 w-full z-40 transition-all duration-300",
        "bg-background/95 backdrop-blur-md border-b border-border/50",
        isScrolled && "shadow-sm"
      )}
    >
      <div className="container mx-auto px-4">
        {/* Mobile Layout */}
        {isMobile ? (
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <MobileMenu />
              <Logo />
            </div>
            
            <div className="flex items-center gap-1">
              <Sheet open={isSearchOpen} onOpenChange={setIsSearchOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span className="sr-only">Search</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="top" className="h-auto">
                  <SheetHeader>
                    <SheetTitle>Search Products</SheetTitle>
                  </SheetHeader>
                  <div className="py-4">
                    <EnhancedSearchBar />
                  </div>
                </SheetContent>
              </Sheet>

              <UserMenu />
            </div>
          </div>
        ) : (
          /* Desktop Layout */
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-10">
              <Logo />
              <DesktopNavigation />
            </div>

            <div className="flex items-center gap-2">
              <EnhancedSearchBar />

              <div className="flex items-center gap-1">
                <LoyaltyPointsBadge />
                
                <Link to="/wishlist">
                  <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-full hover:bg-muted">
                    <Heart className="h-5 w-5" />
                    {itemCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground rounded-full text-xs w-5 h-5 flex items-center justify-center font-medium">
                        {itemCount}
                      </span>
                    )}
                    <span className="sr-only">Wishlist</span>
                  </Button>
                </Link>

                <UserMenu />
                <NotificationsMenu />
                <CartButton />
                <ThemeToggle />
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
