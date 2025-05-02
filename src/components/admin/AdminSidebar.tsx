
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
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
  Calendar,
  LogOut
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const AdminSidebar = () => {
  const { logout } = useAuth();
  
  const adminMenu = [
    { name: "Dashboard", icon: LayoutGrid, path: "/admin" },
    { name: "Products", icon: ShoppingBag, path: "/admin/products" },
    { name: "Categories", icon: Tag, path: "/admin/categories" },
    { name: "Orders", icon: Package, path: "/admin/orders" },
    { name: "Users", icon: Users, path: "/admin/users" },
    { name: "Deliveries", icon: Truck, path: "/admin/deliveries" },
    { name: "Banners", icon: Image, path: "/admin/banners" },
    { name: "Discount Codes", icon: Ticket, path: "/admin/discount-codes" },
    { name: "Daily Offers", icon: BadgePercent, path: "/admin/daily-offers" },
    { name: "Pay Later Verification", icon: FileCheck, path: "/admin/pay-later-verification" },
    { name: "Delivery Zones", icon: Calendar, path: "/admin/delivery-zones" },
    { name: "Settings", icon: Settings, path: "/admin/settings" },
  ];

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  return (
    <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-shrink-0">
      <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">🧺</span>
          <span className="font-bold text-lg">Admin Panel</span>
        </div>
      </div>
      
      <ScrollArea className="h-[calc(100vh-4rem)] py-4">
        <div className="px-3 space-y-1">
          {adminMenu.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                isActive 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </NavLink>
          ))}
        </div>
        
        <div className="px-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-muted-foreground hover:text-foreground"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
          
          <NavLink
            to="/"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors text-muted-foreground hover:bg-muted hover:text-foreground mt-2"
          >
            <ShoppingBag className="h-4 w-4" />
            View Store
          </NavLink>
        </div>
      </ScrollArea>
    </div>
  );
};

export default AdminSidebar;
