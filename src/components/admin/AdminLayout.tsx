
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
  Package 
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdminBanner from "@/components/AdminBanner";
import { Separator } from "@/components/ui/separator";

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is admin
    if (!user || user.role !== "admin") {
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
    { name: "Pay Later Verification", icon: FileCheck, path: "/admin/pay-later-verification" },
    { name: "Discount Codes", icon: CreditCard, path: "/admin/discount-codes" },
    { name: "Settings", icon: Settings, path: "/admin/settings" },
  ];

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
