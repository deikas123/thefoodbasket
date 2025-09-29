import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, ArrowUp } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useIsMobile } from "@/types";
import { cn } from "@/lib/utils";

const FloatingActionButtons = () => {
  const { items, openCart } = useCart();
  const isMobile = useIsMobile();
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      {/* Floating Cart Button - Only show on mobile when there are items */}
      {isMobile && totalItems > 0 && (
        <div className="relative">
          <Button
            onClick={openCart}
            size="lg"
            className={cn(
              "rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-200",
              "bg-primary hover:bg-primary/90 text-primary-foreground"
            )}
          >
            <ShoppingBag className="h-6 w-6" />
          </Button>
          <Badge className="absolute -top-2 -right-2 px-2 py-1 text-xs bg-destructive text-destructive-foreground animate-scale-in">
            {totalItems > 99 ? "99+" : totalItems}
          </Badge>
        </div>
      )}

      {/* Scroll to Top Button */}
      <Button
        onClick={scrollToTop}
        variant="outline"
        size="lg"
        className="rounded-full w-12 h-12 shadow-lg hover:shadow-xl transition-all duration-200 bg-background/95 backdrop-blur-sm"
      >
        <ArrowUp className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default FloatingActionButtons;