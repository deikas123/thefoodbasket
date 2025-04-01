import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { cn } from "@/lib/utils";
import {
  Search,
  ShoppingBag,
  User,
  Heart,
  Menu,
  LogOut,
  Bell,
  Wallet,
  Clock,
  Package,
  ShoppingBasket,
  CalendarClock,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const Header = () => {
  const { user, logout } = useAuth();
  const { items, openCart } = useCart();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

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
        {isMobile && (
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
        )}

        <Link to="/" className="flex items-center gap-2">
          <div className="relative h-8 w-8 md:h-10 md:w-10 flex items-center justify-center">
            <span className="text-2xl md:text-3xl">🧺</span>
          </div>
          <span className="hidden sm:block text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent transition-all">
            The Food Basket
          </span>
        </Link>

        {!isMobile && (
          <NavigationMenu className="hidden md:block">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink
                  className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
                  asChild
                >
                  <Link to="/">Home</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Shop</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid grid-cols-2 gap-3 p-4 w-[400px]">
                    <Link to="/shop">
                      <NavigationMenuLink
                        className={cn(
                          "flex select-none flex-col rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                        )}
                      >
                        <ShoppingBasket className="h-6 w-6 mb-2" />
                        <div className="mb-1 font-medium">All Products</div>
                        <p className="text-sm leading-tight text-muted-foreground">
                          Browse our full catalog of products
                        </p>
                      </NavigationMenuLink>
                    </Link>
                    <Link to="/food-baskets">
                      <NavigationMenuLink
                        className={cn(
                          "flex select-none flex-col rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                        )}
                      >
                        <ShoppingBag className="h-6 w-6 mb-2" />
                        <div className="mb-1 font-medium">Food Baskets</div>
                        <p className="text-sm leading-tight text-muted-foreground">
                          Curated food collections and recipe kits
                        </p>
                      </NavigationMenuLink>
                    </Link>
                    <Link to="/categories/c1">
                      <div className="flex items-center p-2 rounded-md hover:bg-accent">
                        <span className="text-lg mr-2">🍎</span> 
                        Fruits
                      </div>
                    </Link>
                    <Link to="/categories/c2">
                      <div className="flex items-center p-2 rounded-md hover:bg-accent">
                        <span className="text-lg mr-2">🥦</span> 
                        Vegetables
                      </div>
                    </Link>
                    <Link to="/categories/c3">
                      <div className="flex items-center p-2 rounded-md hover:bg-accent">
                        <span className="text-lg mr-2">🥛</span> 
                        Dairy
                      </div>
                    </Link>
                    <Link to="/categories/c4">
                      <div className="flex items-center p-2 rounded-md hover:bg-accent">
                        <span className="text-lg mr-2">🍞</span> 
                        Bakery
                      </div>
                    </Link>
                    <Link to="/categories/c5">
                      <div className="flex items-center p-2 rounded-md hover:bg-accent">
                        <span className="text-lg mr-2">🥩</span> 
                        Meat
                      </div>
                    </Link>
                    <Link to="/categories/c6">
                      <div className="flex items-center p-2 rounded-md hover:bg-accent">
                        <span className="text-lg mr-2">🐟</span> 
                        Seafood
                      </div>
                    </Link>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink
                  className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
                  asChild
                >
                  <Link to="/food-baskets">Food Baskets</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink
                  className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
                  asChild
                >
                  <Link to="/auto-replenish">Auto Replenish</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        )}

        <div className="flex items-center gap-1 md:gap-2">
          {!isMobile && (
            <form onSubmit={handleSearch} className="relative mr-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="pl-8 h-9 md:w-[180px] lg:w-[300px] rounded-full bg-muted focus:bg-background"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </form>
          )}

          {isMobile && (
            <Link to="/shop">
              <Button variant="ghost" size="icon">
                <Search className="h-5 w-5" />
                <span className="sr-only">Search</span>
              </Button>
            </Link>
          )}

          <Link to="/wishlist">
            <Button variant="ghost" size="icon">
              <Heart className="h-5 w-5" />
              <span className="sr-only">Wishlist</span>
            </Button>
          </Link>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {user.email?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                    {user.photoURL && <AvatarImage src={user.photoURL} />}
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/orders" className="cursor-pointer">
                    <Package className="mr-2 h-4 w-4" />
                    <span>Orders</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/wallet" className="cursor-pointer">
                    <Wallet className="mr-2 h-4 w-4" />
                    <span>Wallet</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/pay-later" className="cursor-pointer">
                    <Clock className="mr-2 h-4 w-4" />
                    <span>Pay Later</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/auto-replenish" className="cursor-pointer">
                    <CalendarClock className="mr-2 h-4 w-4" />
                    <span>Auto Replenish</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/login">
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
                <span className="sr-only">Login</span>
              </Button>
            </Link>
          )}

          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="sr-only">Notifications</span>
                  <Badge
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0"
                    variant="destructive"
                  >
                    3
                  </Badge>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-[300px] overflow-y-auto">
                  <div className="p-3 hover:bg-muted rounded-md cursor-pointer">
                    <p className="font-medium text-sm">Your order has been delivered!</p>
                    <p className="text-xs text-muted-foreground">
                      Order #12345 was successfully delivered.
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      10 minutes ago
                    </p>
                  </div>
                  <div className="p-3 hover:bg-muted rounded-md cursor-pointer">
                    <p className="font-medium text-sm">New discount code: SUMMER20</p>
                    <p className="text-xs text-muted-foreground">
                      Save 20% on your next purchase with code SUMMER20.
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">3 hours ago</p>
                  </div>
                  <div className="p-3 hover:bg-muted rounded-md cursor-pointer">
                    <p className="font-medium text-sm">Fresh arrivals in store!</p>
                    <p className="text-xs text-muted-foreground">
                      Check out our newly added seasonal products.
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">1 day ago</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <div className="p-2 text-center">
                  <Link to="/notifications" className="text-sm text-primary">
                    View all notifications
                  </Link>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={openCart}
            className="relative"
          >
            <ShoppingBag className="h-5 w-5" />
            <span className="sr-only">Open cart</span>
            {totalItems > 0 && (
              <Badge
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0"
                variant="default"
              >
                {totalItems}
              </Badge>
            )}
          </Button>
          
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header;
