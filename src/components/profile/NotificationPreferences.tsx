
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

const NotificationPreferences = () => {
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
          <div className="flex items-center space-x-2">
            <Label htmlFor="order-updates-email" className="text-sm">Email</Label>
            <input 
              type="checkbox" 
              id="order-updates-email" 
              defaultChecked 
              className="rounded"
            />
            
            <Label htmlFor="order-updates-sms" className="text-sm ml-4">SMS</Label>
            <input 
              type="checkbox" 
              id="order-updates-sms" 
              defaultChecked 
              className="rounded"
            />
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">Promotions</h4>
            <p className="text-sm text-muted-foreground">
              Receive discounts and promotional offers
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Label htmlFor="promotions-email" className="text-sm">Email</Label>
            <input 
              type="checkbox" 
              id="promotions-email" 
              defaultChecked 
              className="rounded"
            />
            
            <Label htmlFor="promotions-sms" className="text-sm ml-4">SMS</Label>
            <input 
              type="checkbox" 
              id="promotions-sms" 
              className="rounded"
            />
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">New Products</h4>
            <p className="text-sm text-muted-foreground">
              Updates about new products and arrivals
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Label htmlFor="products-email" className="text-sm">Email</Label>
            <input 
              type="checkbox" 
              id="products-email" 
              className="rounded"
            />
            
            <Label htmlFor="products-sms" className="text-sm ml-4">SMS</Label>
            <input 
              type="checkbox" 
              id="products-sms" 
              className="rounded"
            />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button>Save Preferences</Button>
      </CardFooter>
    </Card>
  );
};

export default NotificationPreferences;
