
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";

const CartButton = () => {
  const { items, openCart } = useCart();
  
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
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
  );
};

export default CartButton;
