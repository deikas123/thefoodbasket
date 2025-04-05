
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
  CreditCard,
  Settings,
  Package,
  Image,
  Ticket,
  BadgePercent,
  Calendar
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdminBanner from "@/components/AdminBanner";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is admin
    if (!user) {
      navigate("/login", { state: { from: window.location.pathname } });
      return;
    }
    
    if (user.role !== "admin") {
      toast({
        title: "Access Denied",
        description: "You do not have admin privileges",
        variant: "destructive"
      });
      navigate("/");
    }
  }, [user, navigate]);

  const adminMenu = [
    { name: "Dashboard", icon: LayoutGrid, path: "/admin" },
    { name: "Products", icon: ShoppingBag, path: "/admin/products" },
    { name: "Categories", icon: Tag, path: "/admin/categories" },
    { name: "Orders", icon: Package, path: "/admin/orders" },
    { name: "Users", icon: Users, path: "/admin/users" },
    { name: "Deliveries", icon: Truck, path: "/admin/deliveries" },
    { name: "Banners", icon: Image, path: "/admin/banners" },
    { name: "Coupons", icon: Ticket, path: "/admin/discount-codes" },
    { name: "Daily Offers", icon: BadgePercent, path: "/admin/daily-offers" },
    { name: "Pay Later Verification", icon: FileCheck, path: "/admin/pay-later-verification" },
    { name: "Delivery Zones", icon: Calendar, path: "/admin/delivery-zones" },
    { name: "Settings", icon: Settings, path: "/admin/settings" },
  ];

  // Don't render the admin layout if no user or not an admin
  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <AdminBanner />
      
      <div className="container mx-auto flex-grow px-4 py-8 flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-64 shrink-0">
          <nav className="space-y-1 sticky top-24">
            {adminMenu.map((item) => (
              <a
                key={item.path}
                href={item.path}
                className={`flex items-center px-4 py-3 text-sm rounded-md transition-colors ${
                  window.location.pathname === item.path
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.name}
              </a>
            ))}
          </nav>
        </aside>
        
        {/* Main content */}
        <main className="flex-grow">
          {children}
        </main>
      </div>
      
      <Footer />
    </div>
  );
};

export default AdminLayout;
