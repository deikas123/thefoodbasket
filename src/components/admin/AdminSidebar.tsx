
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
  RefreshCw,
  Settings,
  MessageSquare,
  UserPlus,
  Store,
  ClipboardList,
} from "lucide-react";

const AdminSidebar = () => {
  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
    { icon: Users, label: "Users", path: "/admin/users" },
    { icon: UserPlus, label: "Staff Management", path: "/admin/staff" },
    { icon: MessageSquare, label: "Customer Service", path: "/admin/customer-service" },
    { icon: ShoppingCart, label: "Orders", path: "/admin/orders" },
    { icon: Store, label: "Stores", path: "/admin/stores" },
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
    { icon: RefreshCw, label: "Auto Replenish", path: "/admin/auto-replenish" },
    { icon: Bell, label: "Notifications", path: "/admin/notifications" },
    { icon: FileText, label: "Content", path: "/admin/content" },
    { icon: CreditCard, label: "Pay Later", path: "/admin/pay-later" },
    { icon: ClipboardList, label: "Waitlist", path: "/admin/waitlist" },
    { icon: Settings, label: "Settings", path: "/admin/settings" },
  ];

  return (
    <div className="bg-gray-900 text-white w-64">
      <div className="p-4">
        <h2 className="text-xl font-bold">Admin Panel</h2>
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
                      isActive && "bg-gray-800 text-white border-r-2 border-blue-500"
                    )
                  }
                >
                  <Icon className="h-5 w-5" />
                  <span className="ml-3">{item.label}</span>
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
