
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { useState, useEffect, lazy, Suspense } from "react";
import Preloader from "@/components/Preloader";
import AppRoutes from "@/components/routing/AppRoutes";
import { FloatingChatButtons } from "@/components/chat/FloatingChatButtons";
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
              {isLoading && <Preloader />}
              
              <AppRoutes />
              
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
