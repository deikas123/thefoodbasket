
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Wishlist = () => {
  const { items, removeItem, clearWishlist } = useWishlist();
  const { addItem } = useCart();

  const handleMoveToCart = (productId: string) => {
    const item = items.find(item => item.product.id === productId);
    if (item) {
      addItem(item.product, 1);
      // Optionally remove from wishlist after adding to cart
      // removeItem(productId);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow pt-24 pb-16 px-4 container mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Wishlist</h1>
          <p className="text-muted-foreground">
            Items you've saved for later
          </p>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-16 space-y-6">
            <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-muted">
              <Heart size={40} className="text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">Your wishlist is empty</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Browse our store and save your favorite items by clicking the heart icon.
              </p>
            </div>
            <Button asChild>
              <Link to="/shop">Start Shopping</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex justify-end mb-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearWishlist}
                className="text-sm"
              >
                <Trash2 size={16} className="mr-2" />
                Clear Wishlist
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => (
                <div key={item.product.id} className="border rounded-lg overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                  <div className="aspect-square relative">
                    <img 
                      src={item.product.image} 
                      alt={item.product.name} 
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => removeItem(item.product.id)}
                      className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors"
                      aria-label="Remove from wishlist"
                    >
                      <Heart size={18} className="fill-red-500 text-red-500" />
                    </button>
                  </div>
                  
                  <div className="p-4 flex flex-col flex-grow">
                    <Link to={`/product/${item.product.id}`} className="block">
                      <h3 className="font-medium text-lg mb-1 hover:text-primary transition-colors">{item.product.name}</h3>
                    </Link>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{item.product.description}</p>
                    
                    <div className="mt-auto space-y-3">
                      <div className="font-bold text-lg">${item.product.price.toFixed(2)}</div>
                      <div className="flex space-x-2">
                        <Button className="flex-1" onClick={() => handleMoveToCart(item.product.id)}>
                          <ShoppingCart size={16} className="mr-2" />
                          Add to Cart
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => removeItem(item.product.id)}
                          aria-label="Remove from wishlist"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Wishlist;
