
import { Route } from "react-router-dom";
import { lazy, Suspense, Fragment } from "react";
import LoadingFallback from "@/components/ui/LoadingFallback";

// Lazy load delivery page components
const DeliveryDashboard = lazy(() => import("@/pages/DeliveryDashboard"));
const DeliveryDriverDashboard = lazy(() => import("@/pages/DeliveryDriverDashboard"));
const DeliveryLayout = lazy(() => import("@/components/delivery/DeliveryLayout"));
const Profile = lazy(() => import("@/pages/Profile"));

const DeliveryRoutes = () => {
  return (
    <>
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
    </>
  );
};

export default DeliveryRoutes;
