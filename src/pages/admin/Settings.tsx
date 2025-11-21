
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings as SettingsIcon, Globe } from "lucide-react";
import DeliverySettings from "@/components/admin/delivery/DeliverySettings";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { getWaitlistMode, setWaitlistMode } from "@/services/contentService";
import { toast } from "sonner";

const Settings = () => {
  const [waitlistMode, setWaitlistModeState] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWaitlistMode();
  }, []);

  const loadWaitlistMode = async () => {
    const enabled = await getWaitlistMode();
    setWaitlistModeState(enabled);
    setLoading(false);
  };

  const handleWaitlistToggle = async (checked: boolean) => {
    setWaitlistModeState(checked);
    await setWaitlistMode(checked);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">System Settings</h1>
        <p className="text-muted-foreground">
          Manage your application settings and configurations
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General Settings</TabsTrigger>
          <TabsTrigger value="delivery">Delivery Settings</TabsTrigger>
          <TabsTrigger value="notifications">Notification Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Homepage Mode
                </CardTitle>
                <CardDescription>
                  Switch between normal homepage and waitlist landing page
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="waitlist-mode" className="text-base font-medium">
                      Waitlist Mode
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {waitlistMode 
                        ? "Visitors see the waitlist signup page" 
                        : "Visitors see the normal homepage"}
                    </p>
                  </div>
                  <Switch
                    id="waitlist-mode"
                    checked={waitlistMode}
                    onCheckedChange={handleWaitlistToggle}
                    disabled={loading}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <SettingsIcon className="h-5 w-5" />
                    Application Settings
                  </CardTitle>
                  <CardDescription>
                    Basic application configuration
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    General application settings will be available here.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>
                    Authentication and security configuration
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Security settings will be available here.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="delivery">
          <DeliverySettings />
        </TabsContent>


        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Push Notification Settings</CardTitle>
              <CardDescription>
                Configure push notification services and settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Push notification configuration will be available here. This would typically include:
              </p>
              <ul className="list-disc list-inside mt-2 text-sm text-muted-foreground space-y-1">
                <li>Firebase Cloud Messaging configuration</li>
                <li>Apple Push Notification Service setup</li>
                <li>OneSignal integration</li>
                <li>Notification scheduling settings</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
