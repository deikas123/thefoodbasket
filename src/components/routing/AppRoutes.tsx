
import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import LoadingFallback from "@/components/ui/LoadingFallback";

// Public pages import
import Index from "@/pages/Index";
import { PublicRoutes } from "./PublicRoutes";
import { AdminRoutes } from "./AdminRoutes";
import { DeliveryRoutes } from "./DeliveryRoutes";

// Lazy load NotFound page
const NotFound = lazy(() => import("@/pages/NotFound"));

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Index />} />
      
      {/* Include other route components directly */}
      <PublicRoutes />
      <AdminRoutes />
      <DeliveryRoutes />
      
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
