
import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
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
import { getUserNotifications } from "@/services/notificationService";
import { formatDistanceToNow } from "date-fns";

const NotificationsMenu = () => {
  const { user } = useAuth();
  
  const { data: notifications = [] } = useQuery({
    queryKey: ["user-notifications", user?.id],
    queryFn: () => user?.id ? getUserNotifications(user.id) : Promise.resolve([]),
    enabled: !!user?.id,
    refetchInterval: 60000, // Refetch every minute
  });

  if (!user) {
    return null;
  }

  const unreadCount = notifications.length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notifications</span>
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0"
              variant="destructive"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-[300px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No new notifications
            </div>
          ) : (
            notifications.map((notification) => (
              <div key={notification.id} className="p-3 hover:bg-muted rounded-md cursor-pointer">
                <p className="font-medium text-sm">{notification.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {notification.body}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {notification.sentAt && formatDistanceToNow(new Date(notification.sentAt), { addSuffix: true })}
                </p>
              </div>
            ))
          )}
        </div>
        <DropdownMenuSeparator />
        <div className="p-2 text-center">
          <Link to="/notifications" className="text-sm text-primary hover:underline">
            View all notifications
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationsMenu;
