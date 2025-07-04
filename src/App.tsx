
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { useState, useEffect, lazy, Suspense } from "react";
import ScrollToTop from "@/components/ScrollToTop";
import { FloatingChatButtons } from "@/components/chat/FloatingChatButtons";
import { queryClient, prefetchCriticalData } from "@/lib/queryClient";

// Lazy load components that are not immediately needed
const AppRoutes = lazy(() => import("@/components/routing/AppRoutes"));
const InitialSetup = lazy(() => import("@/components/setup/InitialSetup"));
const OptimizedPreloader = lazy(() => import("@/components/OptimizedPreloader"));

// Simple loading fallback
const SimpleLoader = () => (
  <div className="fixed inset-0 bg-background flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
  </div>
);

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Reduce initial loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    
    // Prefetch critical data in the background
    prefetchCriticalData();
    
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <Suspense fallback={<SimpleLoader />}>
        <OptimizedPreloader />
      </Suspense>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <ScrollToTop />
              
              <Suspense fallback={<SimpleLoader />}>
                <AppRoutes />
              </Suspense>
              
              <FloatingChatButtons />
              
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
