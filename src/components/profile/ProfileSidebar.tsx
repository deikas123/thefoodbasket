
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User, ShoppingBag, Heart, Wallet, Clock, CalendarClock } from "lucide-react";

const ProfileSidebar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="w-full md:w-64 space-y-3 md:space-y-4">
      <Card className="rounded-2xl">
        <CardContent className="p-4">
          {/* Compact mobile header */}
          <div className="flex items-center gap-3 md:flex-col md:items-center md:text-center mb-3 md:mb-6">
            <Avatar className="h-12 w-12 md:h-20 md:w-20 shrink-0">
              <AvatarFallback className="text-lg md:text-2xl bg-primary/10 text-primary">
                {user?.email?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
              {user?.photoURL && <AvatarImage src={user.photoURL} />}
            </Avatar>
            
            <div className="min-w-0">
              <h2 className="text-sm md:text-lg font-bold truncate">
                {user?.firstName
                  ? `${user.firstName} ${user.lastName}`
                  : user?.email}
              </h2>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email}
              </p>
            </div>
          </div>
          
          {/* Mobile: horizontal scrollable pills, Desktop: vertical list */}
          <nav className="flex gap-2 overflow-x-auto scrollbar-hide md:flex-col md:gap-1 pb-1 md:pb-0">
            {[
              { icon: User, label: "Profile", path: "/profile" },
              { icon: ShoppingBag, label: "Orders", path: "/orders" },
              { icon: Heart, label: "Wishlist", path: "/wishlist" },
              { icon: Wallet, label: "Wallet", path: "/wallet" },
              { icon: Clock, label: "Pay Later", path: "/pay-later" },
              { icon: CalendarClock, label: "Auto Replenish", path: "/auto-replenish" },
            ].map(({ icon: Icon, label, path }) => (
              <Button
                key={path}
                variant="ghost"
                size="sm"
                className="shrink-0 h-8 px-3 rounded-full text-xs md:w-full md:justify-start md:rounded-lg md:h-9 md:px-3"
                onClick={() => navigate(path)}
              >
                <Icon className="h-3.5 w-3.5 mr-1.5 md:mr-2" />
                {label}
              </Button>
            ))}
          </nav>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileSidebar;
