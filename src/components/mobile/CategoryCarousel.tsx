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
    <div className="bg-background sticky top-16 z-30 border-b border-border/50 md:hidden">
      <ScrollArea className="w-full">
        <div className="flex gap-3 p-3">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={category.href}
              className={cn(
                "flex flex-col items-center justify-center min-w-[65px] h-[72px] rounded-xl transition-all duration-200",
                "bg-card hover:bg-accent hover:scale-105 active:scale-95",
                "border border-border shadow-sm"
              )}
            >
              <span className="text-xl mb-1.5">{category.icon}</span>
              <span className="text-[10px] font-medium text-center leading-tight px-1">
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