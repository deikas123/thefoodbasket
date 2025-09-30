import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { Home, Store, ShoppingBag, User, MessageCircle } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import CustomerChatWidget from "@/components/chat/CustomerChatWidget";

const BottomNavigation = () => {
  const { itemCount } = useCart();
  const { user } = useAuth();
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 border-t border-border/50 backdrop-blur-md md:hidden shadow-lg">
        <div className="flex items-center justify-around h-16 px-1">
          <NavLink
            to="/"
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 relative",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
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
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )
            }
          >
            <Store className="h-5 w-5" />
            <span className="text-[10px] font-medium">Shop</span>
          </NavLink>

          <NavLink
            to="/checkout"
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 relative",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )
            }
          >
            <div className="relative">
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 && (
                <Badge
                  className="absolute -top-2 -right-2 h-4 w-4 p-0 text-xs flex items-center justify-center"
                  variant="destructive"
                >
                  {itemCount > 99 ? "99+" : itemCount}
                </Badge>
              )}
            </div>
            <span className="text-[10px] font-medium">Cart</span>
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
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )
            }
          >
            <User className="h-5 w-5" />
            <span className="text-[10px] font-medium">{user ? "Profile" : "Login"}</span>
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