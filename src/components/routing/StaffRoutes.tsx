
import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import LoadingFallback from "@/components/ui/LoadingFallback";
import { useAuth } from "@/context/AuthContext";

// Lazy load staff dashboard components
const StaffDashboard = lazy(() => import("@/pages/StaffDashboard"));

const StaffRoutes = () => {
  const { user } = useAuth();

  // Only render staff routes if user has a staff role
  if (!user || user.role === 'customer') {
    return null;
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/*" element={<StaffDashboard />} />
      </Routes>
    </Suspense>
  );
};

export default StaffRoutes;
