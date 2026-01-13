
import { useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import PackerLayout from "./components/PackerLayout";
import PackerDashboard from "./pages/PackerDashboard";
import PackerOrders from "./pages/PackerOrders";
import PackerScan from "./pages/PackerScan";

const PackerApp = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAccess = async () => {
      if (!user) { setHasAccess(false); return; }
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id).in("role", ["admin", "packer", "order_fulfillment"]).single();
      setHasAccess(!!data);
    };
    checkAccess();
  }, [user]);

  if (loading || hasAccess === null) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full" /></div>;
  if (!user || !hasAccess) return <div className="min-h-screen flex items-center justify-center"><div className="text-center p-8"><h1 className="text-2xl font-bold mb-4">Access Denied</h1><button onClick={() => navigate("/login")} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg">Login</button></div></div>;

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
