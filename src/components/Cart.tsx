
import { useCart } from "@/context/CartContext";
import { X, ShoppingCart, Plus, Minus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect } from "react";

const Cart = () => {
  const { items, isOpen, closeCart, removeItem, updateQuantity, total, itemCount } = useCart();

  // Close cart on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        closeCart();
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, closeCart]);

  // Prevent scrolling when cart is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
        onClick={closeCart}
      />
      
      {/* Cart panel */}
      <div className="fixed right-0 top-0 h-full w-full sm:w-[450px] bg-background z-50 shadow-xl animate-slide-in-right">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="border-b p-4 flex items-center justify-between">
            <div className="flex items-center">
              <ShoppingCart className="mr-2" />
              <h2 className="font-semibold text-xl">Your Cart</h2>
              <span className="ml-2 bg-primary/10 text-primary text-sm font-medium px-2 py-0.5 rounded-full">
                {itemCount} {itemCount === 1 ? "item" : "items"}
              </span>
            </div>
            <Button variant="ghost" size="icon" onClick={closeCart}>
              <X size={20} />
              <span className="sr-only">Close</span>
            </Button>
          </div>
          
          {/* Content */}
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-grow p-8 text-center">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                <ShoppingCart size={30} className="text-muted-foreground" />
              </div>
              <h3 className="font-medium text-xl mb-2">Your cart is empty</h3>
              <p className="text-muted-foreground mb-6">Looks like you haven't added any products to your cart yet.</p>
              <Button onClick={closeCart}>Continue Shopping</Button>
            </div>
          ) : (
            <>
              {/* Cart items */}
              <ScrollArea className="flex-grow p-4">
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex gap-4 items-center p-2 border rounded-lg">
                      <div className="relative w-20 h-20 bg-muted rounded-md overflow-hidden">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="flex-grow">
                        <h4 className="font-medium">{item.product.name}</h4>
                        <div className="text-sm text-muted-foreground">
                          ${item.product.price.toFixed(2)} each
                        </div>
                        
                        <div className="flex items-center mt-2">
                          <div className="flex items-center border rounded-md">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-none rounded-l-md"
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            >
                              <Minus size={14} />
                              <span className="sr-only">Decrease</span>
                            </Button>
                            
                            <div className="w-10 text-center text-sm">
                              {item.quantity}
                            </div>
                            
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-none rounded-r-md"
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            >
                              <Plus size={14} />
                              <span className="sr-only">Increase</span>
                            </Button>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 ml-2 text-muted-foreground hover:text-destructive"
                            onClick={() => removeItem(item.product.id)}
                          >
                            <Trash2 size={16} />
                            <span className="sr-only">Remove</span>
                          </Button>
                        </div>
                      </div>
                      
                      <div className="font-medium">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              
              {/* Footer */}
              <div className="border-t p-4 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium">Calculated at checkout</span>
                  </div>
                  <div className="border-t pt-2 mt-2 flex justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="font-semibold">${total.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Button className="w-full button-animation" size="lg">
                    Checkout
                  </Button>
                  <Button variant="outline" className="w-full" onClick={closeCart}>
                    Continue Shopping
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Cart;
