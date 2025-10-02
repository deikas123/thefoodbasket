import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { Home, Store, ShoppingBag, User, MessageCircle, Heart, ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import CustomerChatWidget from "@/components/chat/CustomerChatWidget";

const BottomNavigation = () => {
  const { itemCount, openCart } = useCart();
  const { user } = useAuth();
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border/30 md:hidden shadow-lg">
        <div className="flex items-center justify-around h-16 px-1">
          <NavLink
            to="/"
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 relative",
                isActive ? "text-accent" : "text-muted-foreground hover:text-foreground"
              )
            }
          >
            <Home className="h-5 w-5" />
            <span className="text-[10px] font-medium">Home</span>
          </NavLink>

          <NavLink
            to="/shop"
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 relative",
                isActive ? "text-accent" : "text-muted-foreground hover:text-foreground"
              )
            }
          >
            <Store className="h-5 w-5" />
            <span className="text-[10px] font-medium">Shop</span>
          </NavLink>

          <button
            onClick={openCart}
            className={cn(
              "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 relative",
              "text-muted-foreground hover:text-foreground active:scale-95"
            )}
          >
            <div className="relative">
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <Badge
                  className="absolute -top-2 -right-2 h-5 w-5 p-0 text-[10px] flex items-center justify-center bg-accent text-accent-foreground border-2 border-card"
                  variant="destructive"
                >
                  {itemCount > 99 ? "99+" : itemCount}
                </Badge>
              )}
            </div>
            <span className="text-[10px] font-medium">Cart</span>
          </button>

          <NavLink
            to="/wishlist"
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 relative",
                isActive ? "text-accent" : "text-muted-foreground hover:text-foreground"
              )
            }
          >
            <Heart className="h-5 w-5" />
            <span className="text-[10px] font-medium">Favorite</span>
          </NavLink>

          <button
            onClick={() => setIsChatOpen(true)}
            className={cn(
              "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 relative",
              "text-muted-foreground hover:text-foreground active:scale-95"
            )}
          >
            <MessageCircle className="h-5 w-5" />
            <span className="text-[10px] font-medium">Chat</span>
          </button>

          <NavLink
            to={user ? "/profile" : "/login"}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 relative",
                isActive ? "text-accent" : "text-muted-foreground hover:text-foreground"
              )
            }
          >
            <User className="h-5 w-5" />
            <span className="text-[10px] font-medium">Account</span>
          </NavLink>
        </div>
      </nav>

      <Sheet open={isChatOpen} onOpenChange={setIsChatOpen}>
        <SheetContent side="bottom" className="h-[80vh] p-0">
          <SheetHeader className="p-4 border-b">
            <SheetTitle>Customer Support</SheetTitle>
          </SheetHeader>
          <div className="h-full">
            <CustomerChatWidget />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default BottomNavigation;