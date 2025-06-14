
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
    <div className="md:w-64 space-y-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center mb-6">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarFallback className="text-2xl">
                {user?.email?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
              {user?.photoURL && <AvatarImage src={user.photoURL} />}
            </Avatar>
            
            <h2 className="text-xl font-bold">
              {user?.firstName
                ? `${user.firstName} ${user.lastName}`
                : user?.email}
            </h2>
            <p className="text-sm text-muted-foreground">
              {user?.email}
            </p>
          </div>
          
          <nav className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => navigate("/profile")}
            >
              <User className="mr-2 h-4 w-4" />
              Profile
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => navigate("/orders")}
            >
              <ShoppingBag className="mr-2 h-4 w-4" />
              Orders
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => navigate("/wishlist")}
            >
              <Heart className="mr-2 h-4 w-4" />
              Wishlist
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => navigate("/wallet")}
            >
              <Wallet className="mr-2 h-4 w-4" />
              Wallet
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => navigate("/pay-later")}
            >
              <Clock className="mr-2 h-4 w-4" />
              Pay Later
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => navigate("/auto-replenish")}
            >
              <CalendarClock className="mr-2 h-4 w-4" />
              Auto Replenish
            </Button>
          </nav>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileSidebar;
