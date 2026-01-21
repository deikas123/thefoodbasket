import React, { lazy, Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";

// Lazy load all pages for code splitting
const Waitlist = lazy(() => import("@/pages/Waitlist"));
const Home = lazy(() => import("@/pages/Index"));
const Shop = lazy(() => import("@/pages/Shop"));
const About = lazy(() => import("@/pages/About"));
const ProductDetails = lazy(() => import("@/pages/ProductDetails"));
const Category = lazy(() => import("@/pages/Category"));
const FoodBaskets = lazy(() => import("@/pages/FoodBaskets"));
const AutoReplenish = lazy(() => import("@/pages/AutoReplenish"));
const Login = lazy(() => import("@/pages/Login"));
const Register = lazy(() => import("@/pages/Register"));
const Profile = lazy(() => import("@/pages/Profile"));
const Checkout = lazy(() => import("@/pages/Checkout"));
const Orders = lazy(() => import("@/pages/Orders"));
const OrderDetails = lazy(() => import("@/pages/OrderDetails"));
const Notifications = lazy(() => import("@/pages/Notifications"));
const Wishlist = lazy(() => import("@/pages/Wishlist"));
const Wallet = lazy(() => import("@/pages/Wallet"));
const PayLater = lazy(() => import("@/pages/PayLater"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const AdminRoutes = lazy(() => import("./AdminRoutes"));
const DeliveryRoutes = lazy(() => import("./DeliveryRoutes"));
const StaffRoutes = lazy(() => import("./StaffRoutes"));
const LoyaltyPage = lazy(() => import("@/pages/Loyalty"));
const FlashSales = lazy(() => import("@/pages/FlashSales"));

// Standalone Apps - Lazy loaded for code splitting
const StoreApp = lazy(() => import("@/apps/store/StoreApp"));
const RiderApp = lazy(() => import("@/apps/rider/RiderApp"));
const PackerApp = lazy(() => import("@/apps/packer/PackerApp"));

// Page transition variants
const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.25, ease: "easeOut" }
  },
  exit: { 
    opacity: 0, 
    y: -8,
    transition: { duration: 0.15, ease: "easeIn" }
  }
};

// Animated page wrapper
const AnimatedPage = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial="initial"
    animate="animate"
    exit="exit"
    variants={pageTransition}
  >
    {children}
  </motion.div>
);

// Minimal loading fallback for faster perceived load
const MinimalLoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <motion.div
      className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full"
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
  </div>
);

const LoadingFallback = () => (
  <div className="flex flex-col min-h-screen">
    <div className="h-20 bg-background border-b" />
    <main className="flex-grow pt-8 pb-16 px-4">
      <div className="container mx-auto max-w-7xl">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="aspect-square rounded-lg" />
          <div className="space-y-6">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    </main>
    <div className="h-20 bg-background border-t" />
  </div>
);

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Root route is dynamically controlled by homepage mode inside Index */}
        <Route path="/" element={<AnimatedPage><Home /></AnimatedPage>} />
        <Route path="/waitlist" element={<AnimatedPage><Waitlist /></AnimatedPage>} />
        <Route path="/home" element={<AnimatedPage><Home /></AnimatedPage>} />
        <Route path="/shop" element={<AnimatedPage><Shop /></AnimatedPage>} />
        <Route path="/about" element={<AnimatedPage><About /></AnimatedPage>} />
        <Route path="/product/:id" element={<AnimatedPage><ProductDetails /></AnimatedPage>} />
        <Route path="/categories/:slug" element={<AnimatedPage><Category /></AnimatedPage>} />
        <Route path="/food-baskets" element={<AnimatedPage><FoodBaskets /></AnimatedPage>} />
        <Route path="/auto-replenish" element={<AnimatedPage><AutoReplenish /></AnimatedPage>} />
        <Route path="/login" element={<AnimatedPage><Login /></AnimatedPage>} />
        <Route path="/register" element={<AnimatedPage><Register /></AnimatedPage>} />
        <Route path="/profile" element={<AnimatedPage><Profile /></AnimatedPage>} />
        <Route path="/checkout" element={<AnimatedPage><Checkout /></AnimatedPage>} />
        <Route path="/orders" element={<AnimatedPage><Orders /></AnimatedPage>} />
        <Route path="/orders/:orderId" element={<AnimatedPage><OrderDetails /></AnimatedPage>} />
        <Route path="/notifications" element={<AnimatedPage><Notifications /></AnimatedPage>} />
        <Route path="/wishlist" element={<AnimatedPage><Wishlist /></AnimatedPage>} />
        <Route path="/wallet" element={<AnimatedPage><Wallet /></AnimatedPage>} />
        <Route path="/loyalty" element={<AnimatedPage><LoyaltyPage /></AnimatedPage>} />
        <Route path="/pay-later" element={<AnimatedPage><PayLater /></AnimatedPage>} />
        
        <Route path="/flash-sales" element={<AnimatedPage><FlashSales /></AnimatedPage>} />
        
        {/* Admin Routes */}
        <Route path="/admin/*" element={<AdminRoutes />} />
        
        {/* Delivery Routes */}
        <Route path="/delivery/*" element={<DeliveryRoutes />} />
        
        {/* Staff Routes */}
        <Route path="/staff/*" element={<StaffRoutes />} />
        
        {/* Standalone Apps - Separate bundles for performance */}
        <Route 
          path="/store-app/*" 
          element={
            <Suspense fallback={<MinimalLoadingFallback />}>
              <StoreApp />
            </Suspense>
          } 
        />
        <Route 
          path="/rider-app/*" 
          element={
            <Suspense fallback={<MinimalLoadingFallback />}>
              <RiderApp />
            </Suspense>
          } 
        />
        <Route 
          path="/packer-app/*" 
          element={
            <Suspense fallback={<MinimalLoadingFallback />}>
              <PackerApp />
            </Suspense>
          } 
        />
        
        {/* Catch all route */}
        <Route path="*" element={<AnimatedPage><NotFound /></AnimatedPage>} />
      </Routes>
    </AnimatePresence>
  );
};

const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AnimatedRoutes />
    </Suspense>
  );
};

export default AppRoutes;
