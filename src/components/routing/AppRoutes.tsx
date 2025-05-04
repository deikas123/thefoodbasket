
import { Routes, Route } from "react-router-dom";
import { lazy, Suspense, Fragment } from "react";
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
      
      {/* Wrap route components with Fragment */}
      <Fragment>
        <PublicRoutes />
      </Fragment>
      
      {/* Admin Routes */}
      <Fragment>
        <AdminRoutes />
      </Fragment>
      
      {/* Delivery Routes */}
      <Fragment>
        <DeliveryRoutes />
      </Fragment>
      
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
