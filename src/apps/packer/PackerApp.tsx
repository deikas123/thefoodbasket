
import { Routes, Route, useNavigate } from "react-router-dom";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import PackerLayout from "./components/PackerLayout";
import PackerDashboard from "./pages/PackerDashboard";
import PackerOrders from "./pages/PackerOrders";
import PackerScan from "./pages/PackerScan";

const PackerApp = () => {
  const navigate = useNavigate();
  const { user, hasAccess, isLoading } = useRoleAccess({
    allowedRoles: ["admin", "packer", "order_fulfillment"]
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
            You don't have permission to access the Packer App.
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
      <Route element={<PackerLayout />}>
        <Route index element={<PackerDashboard />} />
        <Route path="orders" element={<PackerOrders />} />
        <Route path="scan" element={<PackerScan />} />
      </Route>
    </Routes>
  );
};

export default PackerApp;
