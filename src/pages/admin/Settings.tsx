
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

const Settings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your application settings and preferences
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="delivery">Delivery</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Site Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="site-name">Site Name</Label>
                  <Input id="site-name" placeholder="Your Store Name" />
                </div>
                <div>
                  <Label htmlFor="site-email">Contact Email</Label>
                  <Input id="site-email" type="email" placeholder="contact@yourstore.com" />
                </div>
              </div>
              <div>
                <Label htmlFor="site-description">Site Description</Label>
                <Input id="site-description" placeholder="Brief description of your store" />
              </div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Business Hours</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="open-time">Opening Time</Label>
                  <Input id="open-time" type="time" defaultValue="09:00" />
                </div>
                <div>
                  <Label htmlFor="close-time">Closing Time</Label>
                  <Input id="close-time" type="time" defaultValue="21:00" />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="24-hours" />
                <Label htmlFor="24-hours">Open 24 hours</Label>
              </div>
              <Button>Update Hours</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="delivery" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="min-order">Minimum Order Amount (KSH)</Label>
                  <Input id="min-order" type="number" placeholder="500" />
                </div>
                <div>
                  <Label htmlFor="free-delivery">Free Delivery Threshold (KSH)</Label>
                  <Input id="free-delivery" type="number" placeholder="2000" />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="express-delivery" />
                <Label htmlFor="express-delivery">Enable Express Delivery</Label>
              </div>
              <Button>Save Delivery Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="mpesa">M-Pesa</Label>
                  <Switch id="mpesa" defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <Label htmlFor="card">Credit/Debit Card</Label>
                  <Switch id="card" defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <Label htmlFor="wallet">Wallet Payment</Label>
                  <Switch id="wallet" defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <Label htmlFor="pay-later">Pay Later</Label>
                  <Switch id="pay-later" defaultChecked />
                </div>
              </div>
              <Button>Update Payment Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="order-notifications">Order Status Notifications</Label>
                  <Switch id="order-notifications" defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <Label htmlFor="promo-notifications">Promotional Notifications</Label>
                  <Switch id="promo-notifications" defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <Switch id="email-notifications" defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <Label htmlFor="sms-notifications">SMS Notifications</Label>
                  <Switch id="sms-notifications" />
                </div>
              </div>
              <Button>Save Notification Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
