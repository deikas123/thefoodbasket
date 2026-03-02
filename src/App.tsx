import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { ComparisonProvider } from "@/context/ComparisonContext";
import { RecentlyViewedProvider } from "@/context/RecentlyViewedContext";
import { useEffect, lazy, Suspense, memo } from "react";
import ScrollToTop from "@/components/ScrollToTop";
import AppRoutes from "@/components/routing/AppRoutes";
import { useIsMobile } from "@/types";
import { queryClient, prefetchCriticalData } from "@/lib/queryClient";

// Lazy load non-critical components for faster initial load
const Cart = lazy(() => import("@/components/Cart"));
const FloatingCompareButton = lazy(() => import("@/components/FloatingCompareButton").then(m => ({ default: m.FloatingCompareButton })));
const BottomNavigation = lazy(() => import("@/components/mobile/BottomNavigation"));
const InitialSetup = lazy(() => import("@/components/setup/InitialSetup"));

function App() {
  useEffect(() => {
    prefetchCriticalData();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <ComparisonProvider>
                <RecentlyViewedProvider>
                  <MobileAwareLayout />
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
const MobileAwareLayout = memo(() => {
  const isMobile = useIsMobile();

  return (
    <>
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
