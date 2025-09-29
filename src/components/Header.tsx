
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
        "fixed top-0 w-full z-40 transition-all duration-300 border-b backdrop-blur-sm",
        isScrolled
          ? "bg-background/98 backdrop-blur-md py-2 shadow-lg border-border/50"
          : "bg-background/90 py-3 md:py-4"
      )}
    >
      <div className="container mx-auto px-3 md:px-4">
        {/* Mobile Layout */}
        {isMobile ? (
          <div className="flex items-center justify-between h-12">
            <div className="flex items-center gap-2">
              <MobileMenu />
              <Logo />
            </div>
            
            <div className="flex items-center gap-1">
              <Sheet open={isSearchOpen} onOpenChange={setIsSearchOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

              <Link to="/wishlist">
                <Button variant="ghost" size="icon" className="relative h-9 w-9">
                  <Heart className="h-4 w-4" />
                  {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full text-xs w-4 h-4 flex items-center justify-center">
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
        ) : (
          /* Desktop Layout */
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Logo />
              <DesktopNavigation />
            </div>

            <div className="flex items-center gap-3">
              <EnhancedSearchBar />

              <div className="flex items-center gap-2">
                <Link to="/wishlist">
                  <Button variant="ghost" size="icon" className="relative">
                    <Heart className="h-5 w-5" />
                    {itemCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full text-xs w-4 h-4 flex items-center justify-center">
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
