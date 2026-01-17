
import { Routes, Route, useNavigate } from "react-router-dom";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import RiderLayout from "./components/RiderLayout";
import RiderDashboard from "./pages/RiderDashboard";
import RiderDeliveries from "./pages/RiderDeliveries";
import RiderHistory from "./pages/RiderHistory";
import RiderProfile from "./pages/RiderProfile";

const RiderApp = () => {
  const navigate = useNavigate();
  const { user, hasAccess, isLoading } = useRoleAccess({
    allowedRoles: ["admin", "delivery", "rider"]
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user || !hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-8 max-w-md">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-4">
            You don't have permission to access the Rider App.
          </p>
          <button 
            onClick={() => navigate("/login")}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route element={<RiderLayout />}>
        <Route index element={<RiderDashboard />} />
        <Route path="deliveries" element={<RiderDeliveries />} />
        <Route path="history" element={<RiderHistory />} />
        <Route path="profile" element={<RiderProfile />} />
      </Route>
    </Routes>
  );
};

export default RiderApp;
