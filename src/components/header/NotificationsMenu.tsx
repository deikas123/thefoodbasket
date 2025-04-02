
import React from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const NotificationsMenu = () => {
  const { user } = useAuth();
  
  if (!user) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notifications</span>
          <Badge
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0"
            variant="destructive"
          >
            3
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-[300px] overflow-y-auto">
          <div className="p-3 hover:bg-muted rounded-md cursor-pointer">
            <p className="font-medium text-sm">Your order has been delivered!</p>
            <p className="text-xs text-muted-foreground">
              Order #12345 was successfully delivered.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              10 minutes ago
            </p>
          </div>
          <div className="p-3 hover:bg-muted rounded-md cursor-pointer">
            <p className="font-medium text-sm">New discount code: SUMMER20</p>
            <p className="text-xs text-muted-foreground">
              Save 20% on your next purchase with code SUMMER20.
            </p>
            <p className="text-xs text-muted-foreground mt-1">3 hours ago</p>
          </div>
          <div className="p-3 hover:bg-muted rounded-md cursor-pointer">
            <p className="font-medium text-sm">Fresh arrivals in store!</p>
            <p className="text-xs text-muted-foreground">
              Check out our newly added seasonal products.
            </p>
            <p className="text-xs text-muted-foreground mt-1">1 day ago</p>
          </div>
        </div>
        <DropdownMenuSeparator />
        <div className="p-2 text-center">
          <Link to="/notifications" className="text-sm text-primary">
            View all notifications
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationsMenu;
