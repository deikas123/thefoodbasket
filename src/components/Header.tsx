
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { Menu, ShoppingCart, Search, X } from "lucide-react";
import { useCart } from "@/context/CartContext";

const Header = () => {
  const { openCart, itemCount } = useCart();
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
        isScrolled ? "bg-white/95 backdrop-blur-md shadow-sm dark:bg-black/90" : "bg-transparent"
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
          <div className="flex items-center space-x-4">
            {/* Search Button (Desktop) */}
            <button 
              onClick={toggleSearch}
              className="hidden md:flex items-center justify-center w-10 h-10 text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors"
              aria-label="Search"
            >
              <Search size={20} />
            </button>

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
          isMobileMenuOpen ? "max-h-64 opacity-100 border-t border-gray-100 dark:border-gray-800" : "max-h-0 opacity-0"
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
