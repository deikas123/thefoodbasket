
import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { PackageCheck, ClipboardList, ScanLine, LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PackerLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navItems = [
    { path: "/packer-app", label: "Dashboard", icon: PackageCheck },
    { path: "/packer-app/orders", label: "Order Queue", icon: ClipboardList },
    { path: "/packer-app/scan", label: "Scan & Pack", icon: ScanLine },
  ];
  const isActive = (path: string) => path === "/packer-app" ? location.pathname === path : location.pathname.startsWith(path);

  return (
    <div className="flex min-h-screen bg-muted/30">
      <div className="hidden md:flex w-64 flex-col bg-background border-r">
        <div className="flex items-center h-16 px-6 border-b"><PackageCheck className="h-6 w-6 text-primary mr-2" /><span className="text-lg font-semibold">Packer App</span></div>
        <nav className="flex-1 p-4 space-y-1">{navItems.map((item) => (<Button key={item.path} variant={isActive(item.path) ? "secondary" : "ghost"} className={cn("w-full justify-start", isActive(item.path) && "bg-primary/10 text-primary")} onClick={() => navigate(item.path)}><item.icon className="mr-2 h-5 w-5" />{item.label}</Button>))}</nav>
        <div className="p-4 border-t"><Button variant="outline" className="w-full" onClick={async () => { await logout(); navigate("/login"); }}><LogOut className="mr-2 h-4 w-4" />Sign Out</Button></div>
      </div>
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-background border-b z-50 flex items-center justify-between px-4">
        <div className="flex items-center"><PackageCheck className="h-5 w-5 text-primary mr-2" /><span className="font-semibold">Packer</span></div>
        <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>{mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</Button>
      </div>
      {mobileMenuOpen && <div className="md:hidden fixed inset-0 top-14 bg-background z-40 p-4"><nav className="space-y-2">{navItems.map((item) => (<Button key={item.path} variant={isActive(item.path) ? "secondary" : "ghost"} className="w-full justify-start" onClick={() => { navigate(item.path); setMobileMenuOpen(false); }}><item.icon className="mr-2 h-5 w-5" />{item.label}</Button>))}</nav></div>}
      <div className="flex-1 md:p-6 p-4 pt-18 md:pt-6"><Outlet /></div>
    </div>
  );
};

export default PackerLayout;
