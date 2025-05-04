
import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import LoadingFallback from "@/components/ui/LoadingFallback";

// Public pages import
import Index from "@/pages/Index";

// Lazy load NotFound page
const NotFound = lazy(() => import("@/pages/NotFound"));

// Lazy load route components
import PublicRoutes from "./PublicRoutes";
import AdminRoutes from "./AdminRoutes";
import DeliveryRoutes from "./DeliveryRoutes";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Index />} />
      
      {/* Include all nested routes */}
      {PublicRoutes()}
      {AdminRoutes()}
      {DeliveryRoutes()}
      
      {/* 404 Route */}
      <Route path="*" element={
        <Suspense fallback={<LoadingFallback />}>
          <NotFound />
        </Suspense>
      } />
    </Routes>
  );
};

export default AppRoutes;
