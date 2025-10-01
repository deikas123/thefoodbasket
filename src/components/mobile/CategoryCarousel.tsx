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
  const categoryColors = [
    "bg-orange-100", "bg-green-100", "bg-yellow-100", "bg-pink-100",
    "bg-red-100", "bg-blue-100", "bg-purple-100", "bg-teal-100"
  ];

  return (
    <div className="bg-background sticky top-16 z-30 md:hidden py-3">
      <ScrollArea className="w-full">
        <div className="flex gap-3 px-4">
          {categories.map((category, index) => (
            <Link
              key={category.id}
              to={category.href}
              className={cn(
                "flex flex-col items-center justify-center min-w-[70px] transition-all duration-200",
                "hover:scale-105 active:scale-95"
              )}
            >
              <div className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center mb-1.5 shadow-sm",
                categoryColors[index % categoryColors.length]
              )}>
                <span className="text-3xl">{category.icon}</span>
              </div>
              <span className="text-[10px] font-medium text-center leading-tight text-foreground">
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