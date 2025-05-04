
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useIsMobile } from "@/types";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Heart } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";

// Import new components
import Logo from "@/components/header/Logo";
import MobileMenu from "@/components/header/MobileMenu";
import DesktopNavigation from "@/components/header/DesktopNavigation";
import SearchBar from "@/components/header/SearchBar";
import UserMenu from "@/components/header/UserMenu";
import NotificationsMenu from "@/components/header/NotificationsMenu";
import CartButton from "@/components/header/CartButton";

const Header = () => {
  const isMobile = useIsMobile();
  const [isScrolled, setIsScrolled] = useState(false);
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
        "fixed top-0 w-full z-40 transition-all duration-200 border-b",
        isScrolled
          ? "bg-background/80 backdrop-blur-md py-2"
          : "bg-background py-4"
      )}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        {isMobile && <MobileMenu />}

        <Logo />

        {!isMobile && <DesktopNavigation />}

        <div className="flex items-center gap-1 md:gap-2">
          {!isMobile && <SearchBar />}

          {isMobile && (
            <Link to="/shop">
              <Button variant="ghost" size="icon">
                <Search className="h-5 w-5" />
                <span className="sr-only">Search</span>
              </Button>
            </Link>
          )}

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
    </header>
  );
};

export default Header;
