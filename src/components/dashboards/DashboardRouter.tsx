
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getUserRole } from "@/services/roleService";
import CustomerServiceDashboard from "./CustomerServiceDashboard";
import OrderFulfillmentDashboard from "./OrderFulfillmentDashboard";
import DeliveryDashboard from "./DeliveryDashboard";
import AccountantDashboard from "./AccountantDashboard";
import Dashboard from "@/pages/admin/Dashboard"; // Admin dashboard

const DashboardRouter = () => {
  const { data: userRole, isLoading } = useQuery({
    queryKey: ["user-role"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      return await getUserRole(user.id);
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    );
  }

  switch (userRole) {
    case 'admin':
      return <Dashboard />;
    case 'customer_service':
      return <CustomerServiceDashboard />;
    case 'order_fulfillment':
      return <OrderFulfillmentDashboard />;
    case 'delivery':
      return <DeliveryDashboard />;
    case 'accountant':
      return <AccountantDashboard />;
    default:
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
            <p className="text-gray-600">You don't have permission to access this dashboard.</p>
          </div>
        </div>
      );
  }
};

export default DashboardRouter;
