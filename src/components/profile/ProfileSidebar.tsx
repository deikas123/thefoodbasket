
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
    <div className="w-full md:w-64 space-y-4">
      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="flex items-center gap-4 md:flex-col md:items-center md:text-center mb-4 md:mb-6">
            <Avatar className="h-16 w-16 md:h-24 md:w-24 md:mb-4 shrink-0">
              <AvatarFallback className="text-xl md:text-2xl">
                {user?.email?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
              {user?.photoURL && <AvatarImage src={user.photoURL} />}
            </Avatar>
            
            <div className="min-w-0">
              <h2 className="text-lg md:text-xl font-bold truncate">
                {user?.firstName
                  ? `${user.firstName} ${user.lastName}`
                  : user?.email}
              </h2>
              <p className="text-sm text-muted-foreground truncate">
                {user?.email}
              </p>
            </div>
          </div>
          
          <nav className="grid grid-cols-3 gap-2 md:grid-cols-1 md:space-y-0">
            <Button
              variant="ghost"
              className="flex flex-col items-center gap-1 h-auto py-3 md:flex-row md:justify-start md:py-2"
              onClick={() => navigate("/profile")}
            >
              <User className="h-5 w-5 md:mr-2 md:h-4 md:w-4" />
              <span className="text-xs md:text-sm">Profile</span>
            </Button>
            <Button
              variant="ghost"
              className="flex flex-col items-center gap-1 h-auto py-3 md:flex-row md:justify-start md:py-2"
              onClick={() => navigate("/orders")}
            >
              <ShoppingBag className="h-5 w-5 md:mr-2 md:h-4 md:w-4" />
              <span className="text-xs md:text-sm">Orders</span>
            </Button>
            <Button
              variant="ghost"
              className="flex flex-col items-center gap-1 h-auto py-3 md:flex-row md:justify-start md:py-2"
              onClick={() => navigate("/wishlist")}
            >
              <Heart className="h-5 w-5 md:mr-2 md:h-4 md:w-4" />
              <span className="text-xs md:text-sm">Wishlist</span>
            </Button>
            <Button
              variant="ghost"
              className="flex flex-col items-center gap-1 h-auto py-3 md:flex-row md:justify-start md:py-2"
              onClick={() => navigate("/wallet")}
            >
              <Wallet className="h-5 w-5 md:mr-2 md:h-4 md:w-4" />
              <span className="text-xs md:text-sm">Wallet</span>
            </Button>
            <Button
              variant="ghost"
              className="flex flex-col items-center gap-1 h-auto py-3 md:flex-row md:justify-start md:py-2"
              onClick={() => navigate("/pay-later")}
            >
              <Clock className="h-5 w-5 md:mr-2 md:h-4 md:w-4" />
              <span className="text-xs md:text-sm">Pay Later</span>
            </Button>
            <Button
              variant="ghost"
              className="flex flex-col items-center gap-1 h-auto py-3 md:flex-row md:justify-start md:py-2"
              onClick={() => navigate("/auto-replenish")}
            >
              <CalendarClock className="h-5 w-5 md:mr-2 md:h-4 md:w-4" />
              <span className="text-xs md:text-sm">Auto Replenish</span>
            </Button>
          </nav>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileSidebar;
