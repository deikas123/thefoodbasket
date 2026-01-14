
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
  Zap,
  Bike,
  PackageCheck,
  ExternalLink,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

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
    { icon: Zap, label: "Flash Sales", path: "/admin/flash-sales" },
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

  const staffApps = [
    { icon: Store, label: "Store App", path: "/store-app", color: "text-emerald-400", description: "Inventory & Orders" },
    { icon: Bike, label: "Rider App", path: "/rider-app", color: "text-blue-400", description: "Deliveries" },
    { icon: PackageCheck, label: "Packer App", path: "/packer-app", color: "text-orange-400", description: "Order Packing" },
  ];

  return (
    <div className="bg-gray-900 text-white w-64 flex flex-col h-full">
      <div className="p-4">
        <h2 className="text-xl font-bold">Admin Panel</h2>
      </div>

      <nav className="mt-4 flex-1 overflow-y-auto">
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

      {/* Staff Apps Section */}
      <div className="border-t border-gray-700 p-4">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Staff Apps
        </h3>
        <div className="space-y-2">
          {staffApps.map((app) => {
            const Icon = app.icon;
            return (
              <a
                key={app.path}
                href={app.path}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg",
                  "bg-gray-800/50 hover:bg-gray-700 transition-colors",
                  "group cursor-pointer"
                )}
              >
                <Icon className={cn("h-5 w-5", app.color)} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{app.label}</p>
                  <p className="text-xs text-gray-400">{app.description}</p>
                </div>
                <ExternalLink className="h-4 w-4 text-gray-500 group-hover:text-gray-300" />
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
