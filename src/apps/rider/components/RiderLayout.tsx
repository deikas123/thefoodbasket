
import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { 
  Bike, 
  Package, 
  History, 
  User, 
  LogOut,
  Menu,
  X,
  MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const RiderLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await logout();
    navigate("/login");
  };

  const navItems = [
    { path: "/rider-app", label: "Dashboard", icon: Bike },
    { path: "/rider-app/deliveries", label: "Active Deliveries", icon: Package },
    { path: "/rider-app/history", label: "History", icon: History },
    { path: "/rider-app/profile", label: "Profile", icon: User },
  ];

  const isActive = (path: string) => {
    if (path === "/rider-app") return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-64 flex-col bg-background border-r">
        <div className="flex items-center h-16 px-6 border-b">
          <Bike className="h-6 w-6 text-primary mr-2" />
          <span className="text-lg font-semibold">Rider App</span>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Button
              key={item.path}
              variant={isActive(item.path) ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start",
                isActive(item.path) && "bg-primary/10 text-primary"
              )}
              onClick={() => navigate(item.path)}
            >
              <item.icon className="mr-2 h-5 w-5" />
              {item.label}
            </Button>
          ))}
        </nav>

        <div className="p-4 border-t">
          <div className="flex items-center gap-2 mb-3 px-2">
            <div className="rounded-full h-8 w-8 bg-primary/10 text-primary flex items-center justify-center text-sm font-medium">
              {user?.email?.[0].toUpperCase() || "R"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.email}</p>
              <p className="text-xs text-muted-foreground">Delivery Rider</p>
            </div>
          </div>
          <Button variant="outline" className="w-full" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-background border-b z-50 flex items-center justify-between px-4">
        <div className="flex items-center">
          <Bike className="h-5 w-5 text-primary mr-2" />
          <span className="font-semibold">Rider App</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-14 bg-background z-40 p-4">
          <nav className="space-y-2">
            {navItems.map((item) => (
              <Button
                key={item.path}
                variant={isActive(item.path) ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => {
                  navigate(item.path);
                  setMobileMenuOpen(false);
                }}
              >
                <item.icon className="mr-2 h-5 w-5" />
                {item.label}
              </Button>
            ))}
          </nav>
          <div className="mt-6 pt-6 border-t">
            <Button variant="outline" className="w-full" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 md:p-6 p-4 pt-18 md:pt-6">
        <Outlet />
      </div>
    </div>
  );
};

export default RiderLayout;
