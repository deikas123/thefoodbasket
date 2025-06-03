
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useIsMobile } from "@/types";

const CartButton = () => {
  const { items, openCart } = useCart();
  const isMobile = useIsMobile();
  
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={openCart}
      className={cn(
        "relative transition-all duration-200 hover:scale-105",
        isMobile ? "h-9 w-9" : "h-10 w-10"
      )}
    >
      <ShoppingBag className={cn(isMobile ? "h-4 w-4" : "h-5 w-5")} />
      <span className="sr-only">Open cart</span>
      {totalItems > 0 && (
        <Badge
          className={cn(
            "absolute -top-1 -right-1 flex items-center justify-center p-0 animate-scale-in",
            isMobile ? "h-4 w-4 text-xs" : "h-5 w-5"
          )}
          variant="default"
        >
          {totalItems > 99 ? "99+" : totalItems}
        </Badge>
      )}
    </Button>
  );
};

export default CartButton;
