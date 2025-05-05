
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, Package, Wallet, Clock, CalendarClock, LogOut, ShieldAlert, Truck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const UserMenu = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) {
    return (
      <Link to="/login">
        <Button variant="ghost" size="icon">
          <User className="h-5 w-5" />
          <span className="sr-only">Login</span>
        </Button>
      </Link>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Avatar className="h-8 w-8">
            <AvatarFallback>
              {user.email?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
            {user.photoURL && <AvatarImage src={user.photoURL} />}
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>My Account</span>
          {user.role === "admin" && (
            <span className="text-xs font-normal px-2 py-0.5 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 rounded-full">
              Admin
            </span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {user.role === "admin" && (
          <DropdownMenuItem asChild>
            <Link to="/admin" className="cursor-pointer">
              <ShieldAlert className="mr-2 h-4 w-4" />
              <span>Admin Dashboard</span>
            </Link>
          </DropdownMenuItem>
        )}
        {user.role === "delivery" && (
          <DropdownMenuItem asChild>
            <Link to="/delivery" className="cursor-pointer">
              <Truck className="mr-2 h-4 w-4" />
              <span>Delivery Dashboard</span>
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <Link to="/profile" className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/orders" className="cursor-pointer">
            <Package className="mr-2 h-4 w-4" />
            <span>Orders</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/wallet" className="cursor-pointer">
            <Wallet className="mr-2 h-4 w-4" />
            <span>Wallet</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/pay-later" className="cursor-pointer">
            <Clock className="mr-2 h-4 w-4" />
            <span>Pay Later</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/auto-replenish" className="cursor-pointer">
            <CalendarClock className="mr-2 h-4 w-4" />
            <span>Auto Replenish</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
