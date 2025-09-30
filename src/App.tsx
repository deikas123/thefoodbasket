
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { useState, useEffect, lazy, Suspense } from "react";
import Preloader from "@/components/Preloader";
import ScrollToTop from "@/components/ScrollToTop";
import AppRoutes from "@/components/routing/AppRoutes";
import FloatingActionButtons from "@/components/FloatingActionButtons";
import BottomNavigation from "@/components/mobile/BottomNavigation";
import CategoryCarousel from "@/components/mobile/CategoryCarousel";
import { useIsMobile } from "@/types";
import { queryClient, prefetchCriticalData } from "@/lib/queryClient";

// Lazy load the initial setup component
const InitialSetup = lazy(() => import("@/components/setup/InitialSetup"));

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Optimize initial loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    // Prefetch critical data
    prefetchCriticalData();
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <MobileAwareLayout isLoading={isLoading} />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

const MobileAwareLayout = ({ isLoading }: { isLoading: boolean }) => {
  const isMobile = useIsMobile();

  return (
    <>
      {isLoading && <Preloader />}
      
      <ScrollToTop />
      {isMobile && <CategoryCarousel />}
      
      <div className={isMobile ? "pb-16" : ""}>
        <AppRoutes />
      </div>
      
      <FloatingActionButtons />
      {isMobile && <BottomNavigation />}
      
      <Suspense fallback={<div />}>
        <InitialSetup />
      </Suspense>
      <Toaster />
    </>
  );
};

export default App;
