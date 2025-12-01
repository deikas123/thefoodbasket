import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useIsMobile } from "@/types";
import { cn } from "@/lib/utils";

const CartButton = () => {
  const { items, openCart } = useCart();
  const isMobile = useIsMobile();
  
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  // Don't show cart button on mobile (it's in bottom nav)
  if (isMobile) return null;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={openCart}
      data-cart-button
      className="relative transition-all duration-200 hover:scale-105 h-10 w-10"
    >
      <ShoppingBag className="h-5 w-5" />
      <span className="sr-only">Open cart</span>
      {totalItems > 0 && (
        <Badge
          className="absolute -top-1 -right-1 flex items-center justify-center p-0 animate-scale-in h-5 w-5"
          variant="default"
        >
          {totalItems > 99 ? "99+" : totalItems}
        </Badge>
      )}
    </Button>
  );
};

export default CartButton;
