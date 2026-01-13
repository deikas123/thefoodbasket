
import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import StoreLayout from "./components/StoreLayout";
import StoreDashboard from "./pages/StoreDashboard";
import StoreInventory from "./pages/StoreInventory";
import StoreOrders from "./pages/StoreOrders";
import StoreAnalytics from "./pages/StoreAnalytics";
import StorePricing from "./pages/StorePricing";

const StoreApp = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [hasStoreAccess, setHasStoreAccess] = useState<boolean | null>(null);
  const [storeId, setStoreId] = useState<string | null>(null);

  useEffect(() => {
    const checkStoreAccess = async () => {
      if (!user) {
        setHasStoreAccess(false);
        return;
      }

      // Check if user is a store admin
      const { data: storeAdmin } = await supabase
        .from("store_admins")
        .select("store_id")
        .eq("user_id", user.id)
        .single();

      if (storeAdmin) {
        setStoreId(storeAdmin.store_id);
        setHasStoreAccess(true);
        return;
      }

      // Also check if user has store_admin role
      const { data: userRole } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .in("role", ["admin", "store_admin"])
        .single();

      setHasStoreAccess(!!userRole);
    };

    checkStoreAccess();
  }, [user]);

  if (loading || hasStoreAccess === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user || !hasStoreAccess) {
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
