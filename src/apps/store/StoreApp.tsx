
import { Routes, Route, useNavigate } from "react-router-dom";
import { useStoreAccess } from "@/hooks/useRoleAccess";
import StoreLayout from "./components/StoreLayout";
import StoreDashboard from "./pages/StoreDashboard";
import StoreInventory from "./pages/StoreInventory";
import StoreOrders from "./pages/StoreOrders";
import StoreAnalytics from "./pages/StoreAnalytics";
import StorePricing from "./pages/StorePricing";

const StoreApp = () => {
  const navigate = useNavigate();
  const { user, hasAccess, storeId, isLoading } = useStoreAccess();

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
            You don't have permission to access the Store App.
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
      <Route element={<StoreLayout storeId={storeId} />}>
        <Route index element={<StoreDashboard storeId={storeId} />} />
        <Route path="inventory" element={<StoreInventory storeId={storeId} />} />
        <Route path="orders" element={<StoreOrders storeId={storeId} />} />
        <Route path="pricing" element={<StorePricing storeId={storeId} />} />
        <Route path="analytics" element={<StoreAnalytics storeId={storeId} />} />
      </Route>
    </Routes>
  );
};

export default StoreApp;
