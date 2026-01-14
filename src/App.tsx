import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { ComparisonProvider } from "@/context/ComparisonContext";
import { RecentlyViewedProvider } from "@/context/RecentlyViewedContext";
import { useState, useEffect, lazy, Suspense, memo, useCallback } from "react";
import ScrollToTop from "@/components/ScrollToTop";
import AppRoutes from "@/components/routing/AppRoutes";
import { useIsMobile } from "@/types";
import { queryClient, prefetchCriticalData } from "@/lib/queryClient";

// Lazy load non-critical components for faster initial load
const Preloader = lazy(() => import("@/components/Preloader"));
const Cart = lazy(() => import("@/components/Cart"));
const FloatingCompareButton = lazy(() => import("@/components/FloatingCompareButton").then(m => ({ default: m.FloatingCompareButton })));
const BottomNavigation = lazy(() => import("@/components/mobile/BottomNavigation"));
const InitialSetup = lazy(() => import("@/components/setup/InitialSetup"));

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Faster initial loading - reduced timeout
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    // Prefetch critical data in parallel
    prefetchCriticalData();
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <ComparisonProvider>
                <RecentlyViewedProvider>
                  <MobileAwareLayout isLoading={isLoading} />
                </RecentlyViewedProvider>
              </ComparisonProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

// Memoized layout component to prevent unnecessary re-renders
const MobileAwareLayout = memo(({ isLoading }: { isLoading: boolean }) => {
  const isMobile = useIsMobile();

  return (
    <>
      {isLoading && (
        <Suspense fallback={<div className="fixed inset-0 bg-background z-50" />}>
          <Preloader />
        </Suspense>
      )}
      
      <ScrollToTop />
      
      <div className={isMobile ? "pb-20" : ""}>
        <AppRoutes />
      </div>
      
      {isMobile && (
        <Suspense fallback={null}>
          <BottomNavigation />
        </Suspense>
      )}
      
      <Suspense fallback={null}>
        <Cart />
        <FloatingCompareButton />
        <InitialSetup />
      </Suspense>
      <Toaster />
    </>
  );
});

MobileAwareLayout.displayName = "MobileAwareLayout";

export default App;
