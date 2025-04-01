
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { 
  User, 
  LogOut, 
  Save,
  Home,
  ShoppingBag,
  Heart,
  Edit,
  Truck,
  RefreshCw,
  ShoppingBasket,
  CalendarClock,
  Wallet
} from "lucide-react";

import WalletCard from "@/components/wallet/WalletCard";
import { getUserKYCStatus } from "@/services/kycService";
import { KYCVerification } from "@/types/kyc";

const Profile = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, updateProfile } = useAuth();
  const { itemCount: cartItemCount } = useCart();
  const { itemCount: wishlistItemCount } = useWishlist();
  
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [dietaryPreferences, setDietaryPreferences] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [kycStatus, setKycStatus] = useState<KYCVerification | null>(null);
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: "/profile" } });
    }
    
    // Initialize form with user data
    if (user) {
      setFirstName(user.firstName);
      setLastName(user.lastName);
      setPhone(user.phone || "");
      setDietaryPreferences((user.dietaryPreferences || []).join(", "));
    }
    
    // Check KYC status
    const checkKYCStatus = async () => {
      try {
        const kyc = await getUserKYCStatus();
        setKycStatus(kyc);
      } catch (error) {
        console.error("Error fetching KYC status:", error);
      }
    };
    
    if (isAuthenticated) {
      checkKYCStatus();
    }
  }, [user, isAuthenticated, navigate]);
  
  const handleUpdateProfile = async () => {
    setIsLoading(true);
    try {
      const dietaryArray = dietaryPreferences
        ? dietaryPreferences.split(",").map(item => item.trim()).filter(Boolean)
        : [];
      
      await updateProfile({
        firstName,
        lastName,
        phone,
        dietaryPreferences: dietaryArray
      });
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
      
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update failed",
        description: "An error occurred while updating your profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  
  if (!user) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow pt-20 pb-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="animate-pulse space-y-8">
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow pt-20 pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold flex items-center">
              <User className="mr-2 h-6 w-6" />
              My Account
            </h1>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* User Profile */}
              <Card>
                <CardHeader className="bg-muted/30 pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle>Personal Information</CardTitle>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="gap-1"
                      onClick={() => setIsEditing(!isEditing)}
                    >
                      <Edit className="h-4 w-4" />
                      {isEditing ? "Cancel" : "Edit"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    {!isEditing ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-1">First Name</h3>
                            <p>{firstName}</p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-1">Last Name</h3>
                            <p>{lastName}</p>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-1">Email Address</h3>
                          <p>{user.email}</p>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-1">Phone Number</h3>
                          <p>{phone || "Not set"}</p>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-1">Dietary Preferences</h3>
                          {user.dietaryPreferences && user.dietaryPreferences.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {user.dietaryPreferences.map((pref, index) => (
                                <Badge key={index} variant="outline">{pref}</Badge>
                              ))}
                            </div>
                          ) : (
                            <p className="text-muted-foreground">No dietary preferences set</p>
                          )}
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-1">Loyalty Points</h3>
                          <p className="flex items-center">
                            {user.loyaltyPoints}
                            <span className="text-sm text-muted-foreground ml-2">
                              points earned
                            </span>
                          </p>
                        </div>
                      </div>
                    ) : (
                      <form className="space-y-4" onSubmit={(e) => {
                        e.preventDefault();
                        handleUpdateProfile();
                      }}>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="firstName">First Name</Label>
                            <Input
                              id="firstName"
                              value={firstName}
                              onChange={(e) => setFirstName(e.target.value)}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input
                              id="lastName"
                              value={lastName}
                              onChange={(e) => setLastName(e.target.value)}
                              required
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="email">Email Address</Label>
                          <Input
                            id="email"
                            type="email"
                            value={user.email}
                            disabled
                            className="bg-muted/50"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Email cannot be changed
                          </p>
                        </div>
                        
                        <div>
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Enter your phone number"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="dietary">Dietary Preferences</Label>
                          <Textarea
                            id="dietary"
                            value={dietaryPreferences}
                            onChange={(e) => setDietaryPreferences(e.target.value)}
                            placeholder="e.g. Vegetarian, Gluten-free, Dairy-free (comma separated)"
                            className="resize-none"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Separate preferences with commas
                          </p>
                        </div>
                        
                        <div className="pt-2">
                          <Button type="submit" className="gap-2" disabled={isLoading}>
                            <Save className="h-4 w-4" />
                            {isLoading ? "Saving..." : "Save Changes"}
                          </Button>
                        </div>
                      </form>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              {/* Account Management */}
              <Card>
                <CardHeader className="bg-muted/30 pb-4">
                  <CardTitle>Account Management</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-medium mb-3">
                        Delivery Addresses
                      </h3>
                      {user.addresses && user.addresses.length > 0 ? (
                        <div className="space-y-4">
                          {user.addresses.map((address, index) => (
                            <div key={address.id} className="flex items-start border rounded p-3">
                              <div className="flex-grow">
                                <div className="flex items-center">
                                  <p className="font-medium">{address.street}</p>
                                  {address.isDefault && (
                                    <Badge className="ml-2">Default</Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {address.city}, {address.state} {address.zipCode}
                                </p>
                              </div>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 border border-dashed rounded-md">
                          <p className="text-muted-foreground mb-2">No saved addresses</p>
                          <Button variant="outline" className="gap-2">
                            <Home className="h-4 w-4" />
                            Add Address
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <Button 
                        variant="destructive" 
                        onClick={handleLogout} 
                        className="gap-2"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Sidebar */}
            <div className="space-y-6">
              {/* Wallet Card */}
              <WalletCard />
              
              {/* Quick Links */}
              <Card>
                <CardHeader className="bg-muted/30 pb-4">
                  <CardTitle>Quick Links</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 gap-3">
                    <Button 
                      variant="outline" 
                      className="justify-start gap-3"
                      onClick={() => navigate("/orders")}
                    >
                      <ShoppingBag className="h-4 w-4" />
                      My Orders
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="justify-start gap-3"
                      onClick={() => navigate("/wishlist")}
                    >
                      <Heart className="h-4 w-4" />
                      Wishlist
                      {wishlistItemCount > 0 && (
                        <Badge className="ml-auto" variant="secondary">
                          {wishlistItemCount}
                        </Badge>
                      )}
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="justify-start gap-3"
                      onClick={() => navigate("/wallet")}
                    >
                      <Wallet className="h-4 w-4" />
                      My Wallet
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="justify-start gap-3"
                      onClick={() => navigate("/pay-later")}
                    >
                      <CalendarClock className="h-4 w-4" />
                      Pay Later
                      {kycStatus?.status === "approved" ? (
                        <Badge variant="outline" className="ml-auto bg-green-50 text-green-600 border-green-200">
                          Approved
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="ml-auto">
                          {kycStatus?.status || "Verify"}
                        </Badge>
                      )}
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="justify-start gap-3"
                      onClick={() => navigate("/auto-replenish")}
                    >
                      <RefreshCw className="h-4 w-4" />
                      Auto-Replenish
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="justify-start gap-3"
                      onClick={() => navigate("/food-baskets")}
                    >
                      <ShoppingBasket className="h-4 w-4" />
                      Food Baskets
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="justify-start gap-3"
                      onClick={() => navigate("/shop")}
                    >
                      <Truck className="h-4 w-4" />
                      Continue Shopping
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
