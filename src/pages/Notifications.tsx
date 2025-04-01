
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Check, Trash2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { Separator } from "@/components/ui/separator";

// Mock notification data - in a real app, this would come from an API
const mockNotifications = [
  {
    id: "1",
    title: "Your order has been delivered!",
    description: "Order #12345 was successfully delivered.",
    time: "10 minutes ago",
    read: false,
    type: "order"
  },
  {
    id: "2",
    title: "New discount code: SUMMER20",
    description: "Save 20% on your next purchase with code SUMMER20.",
    time: "3 hours ago",
    read: false,
    type: "promo"
  },
  {
    id: "3",
    title: "Fresh arrivals in store!",
    description: "Check out our newly added seasonal products.",
    time: "1 day ago",
    read: true,
    type: "product"
  },
  {
    id: "4",
    title: "Your payment was processed",
    description: "We've processed your recent payment of $45.90",
    time: "2 days ago",
    read: true,
    type: "payment"
  },
  {
    id: "5",
    title: "Loyalty points update",
    description: "You've earned 120 new loyalty points from your last order.",
    time: "3 days ago",
    read: true,
    type: "reward"
  }
];

type NotificationType = "all" | "order" | "promo" | "product" | "payment" | "reward";

const Notifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState(mockNotifications);
  const [activeTab, setActiveTab] = useState<NotificationType>("all");
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  const handleMarkAsRead = (id: string) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
    toast({
      title: "Notification marked as read",
      description: "The notification has been marked as read.",
    });
  };
  
  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(notification => ({ ...notification, read: true })));
    toast({
      title: "All notifications marked as read",
      description: "All notifications have been marked as read.",
    });
  };
  
  const handleDelete = (id: string) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
    toast({
      title: "Notification deleted",
      description: "The notification has been deleted.",
      variant: "destructive",
    });
  };
  
  const handleDeleteAll = () => {
    setNotifications([]);
    toast({
      title: "All notifications deleted",
      description: "All notifications have been deleted.",
      variant: "destructive",
    });
  };
  
  const filteredNotifications = activeTab === "all" 
    ? notifications 
    : notifications.filter(notification => notification.type === activeTab);
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 pt-24">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Notifications</h1>
              <p className="text-muted-foreground">
                Stay updated with your orders, promotions and more
              </p>
            </div>
            <div className="flex mt-4 md:mt-0 space-x-2">
              {unreadCount > 0 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleMarkAllAsRead}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Mark all as read
                </Button>
              )}
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleDeleteAll}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear all
              </Button>
            </div>
          </div>
          
          {notifications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Bell className="h-16 w-16 text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">No notifications</h2>
                <p className="text-muted-foreground text-center max-w-sm">
                  You don't have any notifications at the moment. Check back later for updates on your orders, promotions, and more.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <Tabs defaultValue="all" className="mb-6" onValueChange={(value) => setActiveTab(value as NotificationType)}>
                <TabsList className="mb-4">
                  <TabsTrigger value="all">
                    All
                    {unreadCount > 0 && (
                      <Badge variant="secondary" className="ml-2">{unreadCount}</Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="order">Orders</TabsTrigger>
                  <TabsTrigger value="promo">Promotions</TabsTrigger>
                  <TabsTrigger value="product">Products</TabsTrigger>
                  <TabsTrigger value="payment">Payments</TabsTrigger>
                  <TabsTrigger value="reward">Rewards</TabsTrigger>
                </TabsList>
                
                <TabsContent value="all" className="space-y-4">
                  {filteredNotifications.length === 0 ? (
                    <Alert>
                      <AlertTitle>No notifications</AlertTitle>
                      <AlertDescription>
                        You don't have any notifications in this category.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    filteredNotifications.map((notification) => (
                      <Card key={notification.id} className={notification.read ? "opacity-75" : ""}>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-base">{notification.title}</CardTitle>
                            {!notification.read && (
                              <Badge variant="default" className="ml-2">New</Badge>
                            )}
                          </div>
                          <CardDescription className="text-xs">{notification.time}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm">{notification.description}</p>
                        </CardContent>
                        <CardFooter className="flex justify-end space-x-2 pt-0">
                          {!notification.read && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleMarkAsRead(notification.id)}
                            >
                              Mark as read
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDelete(notification.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            Delete
                          </Button>
                        </CardFooter>
                      </Card>
                    ))
                  )}
                </TabsContent>
                
                {["order", "promo", "product", "payment", "reward"].map((type) => (
                  <TabsContent key={type} value={type} className="space-y-4">
                    {notifications.filter(n => n.type === type).length === 0 ? (
                      <Alert>
                        <AlertTitle>No {type} notifications</AlertTitle>
                        <AlertDescription>
                          You don't have any {type} notifications at the moment.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      notifications
                        .filter(n => n.type === type)
                        .map((notification) => (
                          <Card key={notification.id} className={notification.read ? "opacity-75" : ""}>
                            <CardHeader className="pb-2">
                              <div className="flex justify-between items-start">
                                <CardTitle className="text-base">{notification.title}</CardTitle>
                                {!notification.read && (
                                  <Badge variant="default" className="ml-2">New</Badge>
                                )}
                              </div>
                              <CardDescription className="text-xs">{notification.time}</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm">{notification.description}</p>
                            </CardContent>
                            <CardFooter className="flex justify-end space-x-2 pt-0">
                              {!notification.read && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => handleMarkAsRead(notification.id)}
                                >
                                  Mark as read
                                </Button>
                              )}
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleDelete(notification.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                Delete
                              </Button>
                            </CardFooter>
                          </Card>
                        ))
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </>
          )}
          
          <Separator className="my-8" />
          
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Notification Preferences</h2>
            <p className="text-muted-foreground">
              Manage what type of notifications you would like to receive.
            </p>
            <Card>
              <CardContent className="space-y-4 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Order Updates</h3>
                      <p className="text-sm text-muted-foreground">Get notifications about your orders</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="order-notifications" className="h-4 w-4" defaultChecked />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Promotions</h3>
                      <p className="text-sm text-muted-foreground">Get notifications about discounts and offers</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="promo-notifications" className="h-4 w-4" defaultChecked />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">New Product Arrivals</h3>
                      <p className="text-sm text-muted-foreground">Get notifications about new products</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="product-notifications" className="h-4 w-4" defaultChecked />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Payment Updates</h3>
                      <p className="text-sm text-muted-foreground">Get notifications about payments</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="payment-notifications" className="h-4 w-4" defaultChecked />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Loyalty Rewards</h3>
                      <p className="text-sm text-muted-foreground">Get notifications about your loyalty points</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="reward-notifications" className="h-4 w-4" defaultChecked />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Notifications;
