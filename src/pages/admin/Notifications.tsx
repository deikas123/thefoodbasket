
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PlusCircle, Send, Clock, Trash2, Calendar, Users, Settings } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { getNotifications, createNotification, updateNotification, deleteNotification, sendPushNotification } from "@/services/notificationService";
import { Notification } from "@/types/notification";

const NotificationsPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [notification, setNotification] = useState<Partial<Notification>>({
    title: "",
    body: "",
    status: "draft"
  });
  
  const queryClient = useQueryClient();
  
  const notificationsQuery = useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
  });

  const createNotificationMutation = useMutation({
    mutationFn: createNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      setIsDialogOpen(false);
      resetForm();
      toast.success('Notification created successfully');
    },
    onError: (error) => {
      toast.error('Error creating notification: ' + error);
    }
  });

  const sendNotificationMutation = useMutation({
    mutationFn: sendPushNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Notification sent successfully');
    },
    onError: (error) => {
      toast.error('Error sending notification: ' + error);
    }
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Notification deleted successfully');
    },
    onError: (error) => {
      toast.error('Error deleting notification: ' + error);
    }
  });

  const resetForm = () => {
    setNotification({
      title: "",
      body: "",
      status: "draft"
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNotification((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setNotification((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createNotificationMutation.mutate(notification as Omit<Notification, 'id' | 'createdAt'>);
  };

  const handleSendNotification = (notification: Notification) => {
    sendNotificationMutation.mutate(notification);
  };

  const handleDeleteNotification = (id: string) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      deleteNotificationMutation.mutate(id);
    }
  };

  const formatDate = (date: string | undefined) => {
    if (!date) return 'N/A';
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Notifications</h2>
          <p className="text-muted-foreground">
            Manage push notifications for your users
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Create Notification
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>New Notification</DialogTitle>
                <DialogDescription>
                  Create a notification to send to your users
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={notification.title}
                    onChange={handleInputChange}
                    required
                    placeholder="Notification title"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="body">Body</Label>
                  <Textarea
                    id="body"
                    name="body"
                    value={notification.body}
                    onChange={handleInputChange}
                    required
                    placeholder="Notification message"
                    rows={3}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="image">Image URL (optional)</Label>
                  <Input
                    id="image"
                    name="image"
                    value={notification.image || ''}
                    onChange={handleInputChange}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="link">Link (optional)</Label>
                  <Input
                    id="link"
                    name="link"
                    value={notification.link || ''}
                    onChange={handleInputChange}
                    placeholder="https://yourstore.com/products/123"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={notification.status}
                    onValueChange={(value) => handleSelectChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="scheduled">Schedule for later</SelectItem>
                      <SelectItem value="sent">Send immediately</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {notification.status === 'scheduled' && (
                  <div className="grid gap-2">
                    <Label htmlFor="scheduledFor">Schedule Date & Time</Label>
                    <Input
                      id="scheduledFor"
                      name="scheduledFor"
                      type="datetime-local"
                      value={notification.scheduledFor || ''}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                )}
                
                <div className="grid gap-2">
                  <Label htmlFor="targetUserRole">Target User Role (optional)</Label>
                  <Select
                    value={notification.targetUserRole || ''}
                    onValueChange={(value) => handleSelectChange('targetUserRole', value || undefined)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All users" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All users</SelectItem>
                      <SelectItem value="customer">Customers only</SelectItem>
                      <SelectItem value="delivery">Delivery staff only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createNotificationMutation.isPending}>
                  {createNotificationMutation.isPending ? 'Creating...' : 'Create Notification'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="draft">Drafts</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="sent">Sent</TabsTrigger>
        </TabsList>
        {['all', 'draft', 'scheduled', 'sent'].map((tab) => (
          <TabsContent key={tab} value={tab} className="space-y-4">
            {notificationsQuery.isLoading ? (
              <div className="text-center py-10">Loading notifications...</div>
            ) : notificationsQuery.data?.filter(n => tab === 'all' || n.status === tab).length === 0 ? (
              <div className="text-center py-10">No notifications found</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {notificationsQuery.data
                  ?.filter(n => tab === 'all' || n.status === tab)
                  .map((notification) => (
                    <Card key={notification.id}>
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{notification.title}</CardTitle>
                          <div>
                            {notification.status === 'draft' && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                Draft
                              </span>
                            )}
                            {notification.status === 'scheduled' && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Scheduled
                              </span>
                            )}
                            {notification.status === 'sent' && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Sent
                              </span>
                            )}
                          </div>
                        </div>
                        <CardDescription className="text-sm">
                          Created {formatDate(notification.createdAt)}
                          {notification.sentAt && ` • Sent ${formatDate(notification.sentAt)}`}
                          {notification.scheduledFor && ` • Scheduled for ${formatDate(notification.scheduledFor)}`}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <p className="text-sm">{notification.body}</p>
                        {notification.image && (
                          <div className="mt-2">
                            <img
                              src={notification.image}
                              alt="Notification image"
                              className="h-24 rounded-md object-cover"
                            />
                          </div>
                        )}
                        {notification.link && (
                          <div className="mt-2">
                            <a
                              href={notification.link}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-blue-600 hover:underline truncate block"
                            >
                              {notification.link}
                            </a>
                          </div>
                        )}
                        {notification.targetUserRole && (
                          <div className="mt-2 flex items-center">
                            <Users className="h-3 w-3 mr-1 text-gray-500" />
                            <span className="text-xs text-gray-500">
                              Target: {notification.targetUserRole === 'customer' ? 'Customers' : 'Delivery Staff'}
                            </span>
                          </div>
                        )}
                      </CardContent>
                      <CardFooter className="justify-between pt-0">
                        {notification.status === 'draft' && (
                          <Button
                            size="sm"
                            onClick={() => handleSendNotification(notification)}
                            disabled={sendNotificationMutation.isPending}
                          >
                            <Send className="h-4 w-4 mr-2" /> Send Now
                          </Button>
                        )}
                        {notification.status === 'scheduled' && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleSendNotification(notification)}
                            disabled={sendNotificationMutation.isPending}
                          >
                            <Send className="h-4 w-4 mr-2" /> Send Now
                          </Button>
                        )}
                        {notification.status === 'sent' && (
                          <Button size="sm" variant="outline" disabled>
                            <Clock className="h-4 w-4 mr-2" /> Sent
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteNotification(notification.id)}
                          disabled={deleteNotificationMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default NotificationsPage;
