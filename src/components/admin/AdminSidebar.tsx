import React, { useState } from "react";
import { NavLink } from "react-router-dom";
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
  Bell,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const AdminSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

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
    { name: "Notifications", icon: Bell, path: "/admin/notifications" },
    { name: "Content Management", icon: Image, path: "/admin/content-management" },
    { name: "Settings", icon: Settings, path: "/admin/settings" },
  ];

  return (
    <div
      className={cn(
        "flex flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-800">
        <div className={cn("flex items-center", collapsed && "hidden")}>
          <span className="text-xl font-bold">Admin</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="flex lg:hidden"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <nav className="space-y-1 p-2">
          {adminMenu.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center px-3 py-2 text-sm rounded-md transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted",
                  collapsed && "justify-center"
                )
              }
            >
              <item.icon className={cn("h-5 w-5", collapsed ? "" : "mr-3")} />
              {!collapsed && <span>{item.name}</span>}
            </NavLink>
          ))}
        </nav>
      </ScrollArea>
    </div>
  );
};

export default AdminSidebar;
