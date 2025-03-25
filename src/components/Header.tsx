
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { Menu, ShoppingCart, Search, X, User, Heart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const { openCart, itemCount } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount: wishlistCount } = useWishlist();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const toggleSearch = () => setIsSearchOpen(!isSearchOpen);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Shop", path: "/shop" },
    { name: "Categories", path: "/categories" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" }
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link 
            to="/" 
            className="text-2xl font-semibold text-primary flex items-center gap-2 transition-all hover:opacity-90"
          >
            <span className="text-3xl">🧺</span>
            <span>The Food Basket</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex space-x-6">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors font-medium"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            {/* Theme Toggle */}
            <ThemeToggle />
            
            {/* Search Button (Desktop) */}
            <button 
              onClick={toggleSearch}
              className="hidden md:flex items-center justify-center w-10 h-10 text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors"
              aria-label="Search"
            >
              <Search size={20} />
            </button>
            
            {/* Wishlist Button */}
            <Link to="/wishlist" className="relative flex items-center justify-center w-10 h-10 text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors">
              <Heart size={20} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 bg-primary text-white text-xs font-medium rounded-full">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Authentication */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="relative flex items-center gap-2 h-10 px-2 text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors"
                  >
                    <User size={20} />
                    <span className="hidden sm:inline-block">
                      {user?.firstName}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/orders">My Orders</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/wishlist">My Wishlist</Link>
                  </DropdownMenuItem>
                  {user?.role === "admin" && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin">Admin Dashboard</Link>
                    </DropdownMenuItem>
                  )}
                  {user?.role === "delivery" && (
                    <DropdownMenuItem asChild>
                      <Link to="/delivery">Delivery Dashboard</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={logout}
                    className="text-red-500 cursor-pointer"
                  >
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link to="/register">Sign Up</Link>
                </Button>
              </div>
            )}

            {/* Cart Button */}
            <button
              onClick={openCart}
              className="relative flex items-center justify-center w-10 h-10 text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors button-animation"
              aria-label="Shopping Cart"
            >
              <ShoppingCart size={20} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 bg-primary text-white text-xs font-medium rounded-full">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden flex items-center justify-center w-10 h-10 text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors"
              aria-label={isMobileMenuOpen ? "Close Menu" : "Open Menu"}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Search Bar (Expanded) */}
        <div 
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isSearchOpen ? "max-h-16 opacity-100 my-3" : "max-h-0 opacity-0"
          }`}
        >
          <div className="relative w-full max-w-2xl mx-auto">
            <Input 
              type="text" 
              placeholder="Search for products..." 
              className="w-full pl-10 pr-4 py-2 rounded-lg"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <div 
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen ? "max-h-screen opacity-100 border-t border-gray-100 dark:border-gray-800" : "max-h-0 opacity-0"
        }`}
      >
        <div className="container mx-auto px-4 py-3 space-y-2">
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className="block py-2 text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          
          <Link
            to="/wishlist"
            className="block py-2 text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors font-medium"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Wishlist
          </Link>
          
          {/* Authentication (Mobile) */}
          {!isAuthenticated && (
            <div className="pt-2 pb-4 flex flex-col space-y-2">
              <Button asChild>
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>Sign In</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>Sign Up</Link>
              </Button>
            </div>
          )}
          
          {/* Search Bar (Mobile) */}
          <div className="pt-2 pb-4">
            <div className="relative w-full">
              <Input 
                type="text" 
                placeholder="Search..." 
                className="w-full pl-10 pr-4 py-2 rounded-lg"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
