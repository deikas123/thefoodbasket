
import { Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { useState, useEffect } from "react";
import Preloader from "@/components/Preloader";
import AIChatBot from "@/components/AIChatBot";
import LiveChat from "@/components/LiveChat";
import DeliveryDashboard from "./pages/DeliveryDashboard";
import DeliveryDriverDashboard from "./pages/DeliveryDriverDashboard";
import DeliveryLayout from "./components/delivery/DeliveryLayout";

import Index from "./pages/Index";
import Shop from "./pages/Shop";
import Category from "./pages/Category";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import ProductDetails from "./pages/ProductDetails";
import Checkout from "./pages/Checkout";
import Profile from "./pages/Profile";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";
import Wishlist from "./pages/Wishlist";
import Wallet from "./pages/Wallet";
import PayLater from "./pages/PayLater";
import Promotions from "./pages/Promotions";
import FoodBaskets from "./pages/FoodBaskets";
import AutoReplenish from "./pages/AutoReplenish";
import Notifications from "./pages/Notifications";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminLogin from "./pages/admin/AdminLogin";
import DiscountCodes from "./pages/admin/DiscountCodes";

const queryClient = new QueryClient();

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    
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
                <Route path="/categories/:categoryId" element={<Category />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/product/:productId" element={<ProductDetails />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/orders/:orderId" element={<OrderDetails />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/wallet" element={<Wallet />} />
                <Route path="/pay-later" element={<PayLater />} />
                <Route path="/promotions" element={<Promotions />} />
                <Route path="/food-baskets" element={<FoodBaskets />} />
                <Route path="/auto-replenish" element={<AutoReplenish />} />
                <Route path="/notifications" element={<Notifications />} />
                
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/products" element={<AdminDashboard />} />
                <Route path="/admin/orders" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<AdminDashboard />} />
                <Route path="/admin/deliveries" element={<AdminDashboard />} />
                <Route path="/admin/discount-codes" element={<DiscountCodes />} />
                
                {/* Original delivery dashboard (will be removed later) */}
                <Route path="/delivery" element={<DeliveryDashboard />} />
                
                {/* New dedicated delivery driver routes with layout */}
                <Route path="/driver" element={<DeliveryLayout />}>
                  <Route index element={<DeliveryDriverDashboard />} />
                  <Route path="history" element={<DeliveryDriverDashboard />} />
                  <Route path="profile" element={<Profile />} />
                </Route>
                
                <Route path="*" element={<NotFound />} />
              </Routes>
              
              <div className="fixed bottom-6 right-6 flex flex-col space-y-4 items-end z-30">
                <AIChatBot />
                <LiveChat />
              </div>
              
              <Toaster />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
