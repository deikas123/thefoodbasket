import { Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { useState, useEffect, lazy, Suspense } from "react";
import Preloader from "@/components/Preloader";
import AdminLayout from "@/layouts/AdminLayout";

// Public pages
import Index from "./pages/Index";
// Using lazy loading for less frequently visited pages
const Shop = lazy(() => import("./pages/Shop"));
const Category = lazy(() => import("./pages/Category"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ProductDetails = lazy(() => import("./pages/ProductDetails"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Profile = lazy(() => import("./pages/Profile"));
const Orders = lazy(() => import("./pages/Orders"));
const OrderDetails = lazy(() => import("./pages/OrderDetails"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const Wallet = lazy(() => import("./pages/Wallet"));
const PayLater = lazy(() => import("./pages/PayLater"));
const Promotions = lazy(() => import("./pages/Promotions"));
const FoodBaskets = lazy(() => import("./pages/FoodBaskets"));
const AutoReplenish = lazy(() => import("./pages/AutoReplenish"));
const Notifications = lazy(() => import("./pages/Notifications"));

// Admin pages
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const Products = lazy(() => import("./pages/admin/Products"));
const DiscountCodes = lazy(() => import("./pages/admin/DiscountCodes"));
const Categories = lazy(() => import("./pages/admin/Categories"));
const PayLaterVerification = lazy(() => import("./pages/admin/PayLaterVerification"));
const DailyOffers = lazy(() => import("./pages/admin/DailyOffers"));
const AdminNotifications = lazy(() => import("./pages/admin/Notifications"));
const ContentManagement = lazy(() => import("./pages/admin/ContentManagement"));

// Delivery pages
const DeliveryDashboard = lazy(() => import("./pages/DeliveryDashboard"));
const DeliveryDriverDashboard = lazy(() => import("./pages/DeliveryDriverDashboard"));
const DeliveryLayout = lazy(() => import("./components/delivery/DeliveryLayout"));

// Lazy loading for chat components
const AIChatBot = lazy(() => import("./components/AIChatBot"));
const LiveChat = lazy(() => import("./components/LiveChat"));
const InitialSetup = lazy(() => import("./components/setup/InitialSetup"));

// Optimize React Query with better defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      // Add data prefetching
      networkMode: 'offlineFirst',
      // Improve cache hit rate
      gcTime: 1000 * 60 * 10, // 10 minutes
    },
  },
});

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Optimize initial loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    // Prefetch critical data
    queryClient.prefetchQuery({
      queryKey: ["categories"],
      queryFn: () => fetch('/api/categories').then(res => res.json()),
      staleTime: 1000 * 60 * 10 // 10 minutes
    });
    
    return () => clearTimeout(timer);
  }, []);

  // Loading fallback for lazy-loaded components
  const LoadingFallback = () => (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              {isLoading && <Preloader />}
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Index />} />
                <Route path="/shop" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <Shop />
                  </Suspense>
                } />
                <Route path="/categories/:categoryId" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <Category />
                  </Suspense>
                } />
                <Route path="/login" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <Login />
                  </Suspense>
                } />
                <Route path="/register" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <Register />
                  </Suspense>
                } />
                <Route path="/product/:productId" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <ProductDetails />
                  </Suspense>
                } />
                <Route path="/checkout" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <Checkout />
                  </Suspense>
                } />
                <Route path="/profile" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <Profile />
                  </Suspense>
                } />
                <Route path="/orders" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <Orders />
                  </Suspense>
                } />
                <Route path="/orders/:orderId" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <OrderDetails />
                  </Suspense>
                } />
                <Route path="/wishlist" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <Wishlist />
                  </Suspense>
                } />
                <Route path="/wallet" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <Wallet />
                  </Suspense>
                } />
                <Route path="/pay-later" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <PayLater />
                  </Suspense>
                } />
                <Route path="/promotions" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <Promotions />
                  </Suspense>
                } />
                <Route path="/food-baskets" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <FoodBaskets />
                  </Suspense>
                } />
                <Route path="/auto-replenish" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <AutoReplenish />
                  </Suspense>
                } />
                <Route path="/notifications" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <Notifications />
                  </Suspense>
                } />
                
                {/* Admin Login (outside of admin layout) */}
                <Route path="/admin/login" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <AdminLogin />
                  </Suspense>
                } />
                
                {/* Admin Routes with AdminLayout */}
                <Route path="/admin" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <AdminLayout>
                      <AdminDashboard />
                    </AdminLayout>
                  </Suspense>
                } />
                <Route path="/admin/products" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <AdminLayout>
                      <Products />
                    </AdminLayout>
                  </Suspense>
                } />
                <Route path="/admin/categories" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <AdminLayout>
                      <Categories />
                    </AdminLayout>
                  </Suspense>
                } />
                <Route path="/admin/orders" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <AdminLayout>
                      <AdminDashboard />
                    </AdminLayout>
                  </Suspense>
                } />
                <Route path="/admin/users" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <AdminLayout>
                      <AdminDashboard />
                    </AdminLayout>
                  </Suspense>
                } />
                <Route path="/admin/deliveries" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <AdminLayout>
                      <AdminDashboard />
                    </AdminLayout>
                  </Suspense>
                } />
                <Route path="/admin/banners" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <AdminLayout>
                      <AdminDashboard />
                    </AdminLayout>
                  </Suspense>
                } />
                <Route path="/admin/discount-codes" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <AdminLayout>
                      <DiscountCodes />
                    </AdminLayout>
                  </Suspense>
                } />
                <Route path="/admin/daily-offers" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <AdminLayout>
                      <DailyOffers />
                    </AdminLayout>
                  </Suspense>
                } />
                <Route path="/admin/pay-later-verification" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <AdminLayout>
                      <PayLaterVerification />
                    </AdminLayout>
                  </Suspense>
                } />
                <Route path="/admin/delivery-zones" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <AdminLayout>
                      <AdminDashboard />
                    </AdminLayout>
                  </Suspense>
                } />
                <Route path="/admin/settings" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <AdminLayout>
                      <AdminDashboard />
                    </AdminLayout>
                  </Suspense>
                } />
                <Route path="/admin/notifications" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <AdminLayout>
                      <AdminNotifications />
                    </AdminLayout>
                  </Suspense>
                } />
                <Route path="/admin/content-management" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <AdminLayout>
                      <ContentManagement />
                    </AdminLayout>
                  </Suspense>
                } />
                
                {/* Delivery Routes */}
                <Route path="/delivery" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <DeliveryDashboard />
                  </Suspense>
                } />
                
                <Route path="/driver" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <DeliveryLayout />
                  </Suspense>
                }>
                  <Route index element={
                    <Suspense fallback={<LoadingFallback />}>
                      <DeliveryDriverDashboard />
                    </Suspense>
                  } />
                  <Route path="history" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <DeliveryDriverDashboard />
                    </Suspense>
                  } />
                  <Route path="profile" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <Profile />
                    </Suspense>
                  } />
                </Route>
                
                <Route path="*" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <NotFound />
                  </Suspense>
                } />
              </Routes>
              
              <div className="fixed bottom-6 right-6 flex flex-col space-y-4 items-end z-30">
                <Suspense fallback={<div />}>
                  <AIChatBot />
                </Suspense>
                <Suspense fallback={<div />}>
                  <LiveChat />
                </Suspense>
              </div>
              
              <Suspense fallback={<div />}>
                <InitialSetup />
              </Suspense>
              <Toaster />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
