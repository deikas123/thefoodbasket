import React from "react";
import { Link } from "react-router-dom";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  icon: string;
  href: string;
}

const categories: Category[] = [
  { id: "1", name: "Fruits", icon: "🍎", href: "/shop?category=fruits" },
  { id: "2", name: "Vegetables", icon: "🥕", href: "/shop?category=vegetables" },
  { id: "3", name: "Dairy", icon: "🥛", href: "/shop?category=dairy" },
  { id: "4", name: "Bakery", icon: "🍞", href: "/shop?category=bakery" },
  { id: "5", name: "Meat", icon: "🥩", href: "/shop?category=meat" },
  { id: "6", name: "Seafood", icon: "🐟", href: "/shop?category=seafood" },
  { id: "7", name: "Snacks", icon: "🍿", href: "/shop?category=snacks" },
  { id: "8", name: "Beverages", icon: "🥤", href: "/shop?category=beverages" },
];

const CategoryCarousel = () => {
  return (
    <div className="bg-background/95 sticky top-16 z-30 border-b border-border/30 md:hidden backdrop-blur-sm">
      <ScrollArea className="w-full">
        <div className="flex gap-2.5 p-3">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={category.href}
              className={cn(
                "flex flex-col items-center justify-center min-w-[68px] h-[68px] rounded-2xl transition-all duration-200",
                "bg-gradient-to-br from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10",
                "hover:scale-105 active:scale-95",
                "border border-primary/20 shadow-sm"
              )}
            >
              <span className="text-2xl mb-1">{category.icon}</span>
              <span className="text-[9px] font-semibold text-center leading-tight px-1">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="hidden" />
      </ScrollArea>
    </div>
  );
};

export default CategoryCarousel;