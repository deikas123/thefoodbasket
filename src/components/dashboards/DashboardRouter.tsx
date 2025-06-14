
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getUserRole } from "@/services/roleService";
import CustomerServiceDashboard from "./CustomerServiceDashboard";
import OrderFulfillmentDashboard from "./OrderFulfillmentDashboard";
import DeliveryDashboard from "./DeliveryDashboard";
import AccountantDashboard from "./AccountantDashboard";
import { Navigate } from "react-router-dom";

const DashboardRouter = () => {
  const { data: userRole, isLoading, error } = useQuery({
    queryKey: ["user-role"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log("DashboardRouter - No user found");
        return null;
      }
      
      console.log("DashboardRouter - User found:", user.id);
      const role = await getUserRole(user.id);
      console.log("DashboardRouter - User role:", role);
      return role;
    },
    retry: 3,
    retryDelay: 1000
  });

  console.log("DashboardRouter - Current state:", { userRole, isLoading, error });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    console.error("Error loading user role:", error);
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Error Loading Dashboard</h2>
          <p className="text-gray-600">Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  // If user is admin, redirect to admin dashboard
  if (userRole === 'admin') {
    console.log("DashboardRouter - Redirecting admin to admin dashboard");
    return <Navigate to="/admin" replace />;
  }

  // Handle staff roles
  switch (userRole) {
    case 'customer_service':
      console.log("DashboardRouter - Rendering CustomerServiceDashboard");
      return <CustomerServiceDashboard />;
    case 'order_fulfillment':
      console.log("DashboardRouter - Rendering OrderFulfillmentDashboard");
      return <OrderFulfillmentDashboard />;
    case 'delivery':
      console.log("DashboardRouter - Rendering DeliveryDashboard");
      return <DeliveryDashboard />;
    case 'accountant':
      console.log("DashboardRouter - Rendering AccountantDashboard");
      return <AccountantDashboard />;
    case 'customer':
      // Regular customers shouldn't access staff dashboard
      console.log("DashboardRouter - Customer trying to access staff dashboard");
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
            <p className="text-gray-600">You don't have permission to access this dashboard.</p>
          </div>
        </div>
      );
    default:
      console.log("DashboardRouter - Unknown or null role:", userRole);
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
            <p className="text-gray-600">You don't have permission to access this dashboard.</p>
            <p className="text-xs text-gray-400 mt-2">Role: {userRole || 'Unknown'}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
  }
};

export default DashboardRouter;
