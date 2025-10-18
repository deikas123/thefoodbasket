import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { getUserProfile, updateUserProfile } from "@/services/profileService";

const NotificationPreferences = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [preferences, setPreferences] = useState({
    orderEmail: true,
    orderSms: true,
    promoEmail: true,
    promoSms: false,
    productEmail: false,
    productSms: false,
  });

  useEffect(() => {
    const fetchPreferences = async () => {
      if (!user?.id) return;
      
      try {
        const profile = await getUserProfile(user.id);
        if (profile) {
          setPreferences({
            orderEmail: profile.notification_order_email ?? true,
            orderSms: profile.notification_order_sms ?? true,
            promoEmail: profile.notification_promo_email ?? true,
            promoSms: profile.notification_promo_sms ?? false,
            productEmail: profile.notification_product_email ?? false,
            productSms: profile.notification_product_sms ?? false,
          });
        }
      } catch (error) {
        console.error("Error fetching notification preferences:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPreferences();
  }, [user?.id]);

  const handleSave = async () => {
    if (!user?.id) return;
    
    setIsSaving(true);
    try {
      await updateUserProfile(user.id, {
        notification_order_email: preferences.orderEmail,
        notification_order_sms: preferences.orderSms,
        notification_promo_email: preferences.promoEmail,
        notification_promo_sms: preferences.promoSms,
        notification_product_email: preferences.productEmail,
        notification_product_sms: preferences.productSms,
      });
      
      toast({
        title: "Preferences Saved",
        description: "Your notification preferences have been updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">Loading preferences...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>
          Manage your notification settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">Order Updates</h4>
            <p className="text-sm text-muted-foreground">
              Receive updates about your orders
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="order-updates-email"
                checked={preferences.orderEmail}
                onCheckedChange={(checked) => 
                  setPreferences(prev => ({ ...prev, orderEmail: checked as boolean }))
                }
              />
              <Label htmlFor="order-updates-email" className="text-sm cursor-pointer">Email</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="order-updates-sms"
                checked={preferences.orderSms}
                onCheckedChange={(checked) => 
                  setPreferences(prev => ({ ...prev, orderSms: checked as boolean }))
                }
              />
              <Label htmlFor="order-updates-sms" className="text-sm cursor-pointer">SMS</Label>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">Promotions</h4>
            <p className="text-sm text-muted-foreground">
              Receive discounts and promotional offers
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="promotions-email"
                checked={preferences.promoEmail}
                onCheckedChange={(checked) => 
                  setPreferences(prev => ({ ...prev, promoEmail: checked as boolean }))
                }
              />
              <Label htmlFor="promotions-email" className="text-sm cursor-pointer">Email</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="promotions-sms"
                checked={preferences.promoSms}
                onCheckedChange={(checked) => 
                  setPreferences(prev => ({ ...prev, promoSms: checked as boolean }))
                }
              />
              <Label htmlFor="promotions-sms" className="text-sm cursor-pointer">SMS</Label>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">New Products</h4>
            <p className="text-sm text-muted-foreground">
              Updates about new products and arrivals
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="products-email"
                checked={preferences.productEmail}
                onCheckedChange={(checked) => 
                  setPreferences(prev => ({ ...prev, productEmail: checked as boolean }))
                }
              />
              <Label htmlFor="products-email" className="text-sm cursor-pointer">Email</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="products-sms"
                checked={preferences.productSms}
                onCheckedChange={(checked) => 
                  setPreferences(prev => ({ ...prev, productSms: checked as boolean }))
                }
              />
              <Label htmlFor="products-sms" className="text-sm cursor-pointer">SMS</Label>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Preferences"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default NotificationPreferences;
