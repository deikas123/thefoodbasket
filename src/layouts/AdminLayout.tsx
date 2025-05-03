
import React, { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { 
  LayoutGrid, 
  ShoppingBag, 
  Tag, 
  Users, 
  Truck, 
  FileCheck, 
  Settings,
  Package,
  Image,
  Ticket,
  BadgePercent,
  Calendar
} from "lucide-react";
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
    // Check if user is authenticated
    if (!user) {
      toast.error("Authentication Required", {
        description: "Please log in to access the admin panel"
      });
      navigate("/admin/login", { state: { from: window.location.pathname } });
      return;
    }
    
    // Check if user is admin
    if (user.role !== "admin") {
      toast.error("Access Denied", {
        description: "You do not have admin privileges"
      });
      navigate("/");
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
