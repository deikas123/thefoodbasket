
import { Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { useState, useEffect } from "react";
import Preloader from "@/components/Preloader";

import Index from "./pages/Index";
import Shop from "./pages/Shop";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import ProductDetails from "./pages/ProductDetails";
import Checkout from "./pages/Checkout";
import Profile from "./pages/Profile";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";
import Wishlist from "./pages/Wishlist";
import AdminDashboard from "./pages/admin/Dashboard";

const queryClient = new QueryClient();

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time - in a real app this would be based on actual data loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 5000); // 5 seconds to show the preloader
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              {isLoading && <Preloader />}
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/product/:productId" element={<ProductDetails />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/orders/:orderId" element={<OrderDetails />} />
                <Route path="/wishlist" element={<Wishlist />} />
                
                {/* Admin Routes */}
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/products" element={<AdminDashboard />} />
                <Route path="/admin/orders" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<AdminDashboard />} />
                <Route path="/admin/deliveries" element={<AdminDashboard />} />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
