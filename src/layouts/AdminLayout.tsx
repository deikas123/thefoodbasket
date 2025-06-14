
import React, { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminSidebar from "@/components/admin/AdminSidebar";

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("AdminLayout mounting, user:", user);
    
    // Check if user is authenticated
    if (!user) {
      console.log("No user found, redirecting to login");
      toast.error("Authentication Required", {
        description: "Please log in to access the admin panel"
      });
      navigate("/admin/login", { replace: true });
      return;
    }
    
    console.log("Current user role:", user.role);
    
    // Check if user is admin
    if (user.role !== "admin") {
      console.log("User is not admin, redirecting to home");
      toast.error("Access Denied", {
        description: "You do not have admin privileges"
      });
      navigate("/", { replace: true });
      return;
    }
  }, [user, navigate]);

  // Don't render the admin layout if no user or not an admin
  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminSidebar />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <AdminHeader />
        
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
