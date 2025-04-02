
import React from "react";
import { Link } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { ShoppingBasket, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";

const DesktopNavigation = () => {
  return (
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
  );
};

export default DesktopNavigation;
