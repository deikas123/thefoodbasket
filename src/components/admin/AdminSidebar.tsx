
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  Tag,
  Image,
  Percent,
  Tags,
  Truck,
  MapPin,
  TicketPercent,
  Bell,
  FileText,
  CreditCard,
  Award,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const AdminSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
    { icon: Users, label: "Users", path: "/admin/users" },
    { icon: ShoppingCart, label: "Orders", path: "/admin/orders" },
    { icon: Package, label: "Products", path: "/admin/products" },
    { icon: Tag, label: "Categories", path: "/admin/categories" },
    { icon: Image, label: "Banners", path: "/admin/banners" },
    { icon: Percent, label: "Daily Offers", path: "/admin/daily-offers" },
    { icon: Tags, label: "Tags", path: "/admin/tags" },
    { icon: Truck, label: "Deliveries", path: "/admin/deliveries" },
    { icon: MapPin, label: "Delivery Options", path: "/admin/delivery-options" },
    { icon: MapPin, label: "Delivery Zones", path: "/admin/delivery-zones" },
    { icon: TicketPercent, label: "Discount Codes", path: "/admin/discount-codes" },
    { icon: Award, label: "Loyalty Points", path: "/admin/loyalty" },
    { icon: Bell, label: "Notifications", path: "/admin/notifications" },
    { icon: FileText, label: "Content", path: "/admin/content" },
    { icon: CreditCard, label: "Pay Later", path: "/admin/pay-later" },
    { icon: Settings, label: "Settings", path: "/admin/settings" },
  ];

  return (
    <div className={cn("bg-gray-900 text-white transition-all duration-300", collapsed ? "w-16" : "w-64")}>
      <div className="p-4">
        <div className="flex items-center justify-between">
          {!collapsed && <h2 className="text-xl font-bold">Admin Panel</h2>}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded hover:bg-gray-800 transition-colors"
          >
            {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <nav className="mt-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.path === "/admin"}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors",
                      isActive && "bg-gray-800 text-white border-r-2 border-blue-500",
                      collapsed && "justify-center px-2"
                    )
                  }
                >
                  <Icon className="h-5 w-5" />
                  {!collapsed && <span className="ml-3">{item.label}</span>}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default AdminSidebar;
