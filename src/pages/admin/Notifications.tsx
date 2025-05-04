
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, Bell, Trash2, Edit, Clock, Settings } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getNotifications, createNotification, updateNotification, deleteNotification, sendPushNotification } from "@/services/notificationService";
import { Notification, NotificationTrigger } from "@/types/notification";
import { DatePicker } from "@/components/ui/date-picker";

const NotificationsPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [notification, setNotification] = useState<Partial<Notification>>({
    title: '',
    body: '',
    status: 'draft',
  });
  const [isScheduled, setIsScheduled] = useState(false);
  const [isTriggered, setIsTriggered] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>();
  const [trigger, setTrigger] = useState<Partial<NotificationTrigger>>({
    type: 'order_status',
    condition: 'equals',
    value: '',
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
    },
  });

  const updateNotificationMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Notification> }) => 
      updateNotification(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      setIsDialogOpen(false);
      resetForm();
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const sendNotificationMutation = useMutation({
    mutationFn: sendPushNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const resetForm = () => {
    setNotification({
      title: '',
      body: '',
      status: 'draft',
    });
    setIsScheduled(false);
    setIsTriggered(false);
    setScheduledDate(undefined);
    setTrigger({
      type: 'order_status',
      condition: 'equals',
      value: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let notificationToSave: Partial<Notification> = {
      ...notification,
    };
    
    if (isScheduled) {
      notificationToSave.status = 'scheduled';
      notificationToSave.scheduledFor = scheduledDate?.toISOString();
    } else if (isTriggered) {
      notificationToSave.status = 'scheduled';
      notificationToSave.trigger = trigger as NotificationTrigger;
    }
    
    if (notification.id) {
      updateNotificationMutation.mutate({ 
        id: notification.id, 
        updates: notificationToSave 
      });
    } else {
      createNotificationMutation.mutate(notificationToSave as Omit<Notification, 'id' | 'createdAt'>);
    }
  };

  const handleEdit = (item: Notification) => {
    setNotification(item);
    setIsScheduled(!!item.scheduledFor);
    setIsTriggered(!!item.trigger);
    if (item.scheduledFor) {
      setScheduledDate(new Date(item.scheduledFor));
    }
    if (item.trigger) {
      setTrigger(item.trigger);
    }
    setIsDialogOpen(true);
  };

  const handleSendNow = (item: Notification) => {
    sendNotificationMutation.mutate(item);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Notifications</h2>
          <p className="text-muted-foreground">
            Create and manage push notifications for your customers
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Bell className="mr-2 h-4 w-4" /> New Notification
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {notification.id ? 'Edit Notification' : 'Create Notification'}
                </DialogTitle>
                <DialogDescription>
                  Compose a notification to send to your customers
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={notification.title || ''}
                    onChange={(e) => setNotification({...notification, title: e.target.value})}
                    placeholder="Notification title"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="body">Message</Label>
                  <Textarea
                    id="body"
                    value={notification.body || ''}
                    onChange={(e) => setNotification({...notification, body: e.target.value})}
                    placeholder="Notification message"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="image">Image URL (optional)</Label>
                  <Input
                    id="image"
                    value={notification.image || ''}
                    onChange={(e) => setNotification({...notification, image: e.target.value})}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="link">Link URL (optional)</Label>
                  <Input
                    id="link"
                    value={notification.link || ''}
                    onChange={(e) => setNotification({...notification, link: e.target.value})}
                    placeholder="https://example.com/page"
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="schedule">Schedule for later</Label>
                    <Switch
                      id="schedule"
                      checked={isScheduled}
                      onCheckedChange={(checked) => {
                        setIsScheduled(checked);
                        if (checked) setIsTriggered(false);
                      }}
                    />
                  </div>
                  {isScheduled && (
                    <div className="pt-2">
                      <Label className="mb-2 block">Schedule Date</Label>
                      <DatePicker
                        date={scheduledDate}
                        setDate={setScheduledDate}
                        showTimePicker
                      />
                    </div>
                  )}
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="trigger">Based on trigger</Label>
                    <Switch
                      id="trigger"
                      checked={isTriggered}
                      onCheckedChange={(checked) => {
                        setIsTriggered(checked);
                        if (checked) setIsScheduled(false);
                      }}
                    />
                  </div>
                  {isTriggered && (
                    <div className="grid grid-cols-3 gap-4 pt-2">
                      <div>
                        <Label className="mb-2 block">Trigger Type</Label>
                        <Select
                          value={trigger.type}
                          onValueChange={(value) => setTrigger({...trigger, type: value as any})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select trigger" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="order_status">Order Status</SelectItem>
                            <SelectItem value="product_stock">Product Stock</SelectItem>
                            <SelectItem value="user_inactivity">User Inactivity</SelectItem>
                            <SelectItem value="abandoned_cart">Abandoned Cart</SelectItem>
                            <SelectItem value="special_day">Special Day</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="mb-2 block">Condition</Label>
                        <Select
                          value={trigger.condition}
                          onValueChange={(value) => setTrigger({...trigger, condition: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Condition" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="equals">Equals</SelectItem>
                            <SelectItem value="not_equals">Not equals</SelectItem>
                            <SelectItem value="greater_than">Greater than</SelectItem>
                            <SelectItem value="less_than">Less than</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="mb-2 block">Value</Label>
                        <Input
                          value={trigger.value || ''}
                          onChange={(e) => setTrigger({...trigger, value: e.target.value})}
                          placeholder="Trigger value"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {notification.id ? 'Update' : 'Create'}
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {notificationsQuery.data
                  ?.filter(n => tab === 'all' || n.status === tab)
                  .map((item) => (
                    <Card key={item.id}>
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{item.title}</CardTitle>
                          <div>
                            {item.status === 'draft' && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                Draft
                              </span>
                            )}
                            {item.status === 'sent' && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Sent
                              </span>
                            )}
                            {item.status === 'scheduled' && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Scheduled
                              </span>
                            )}
                          </div>
                        </div>
                        <CardDescription className="text-sm">
                          {item.body}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        {item.trigger && (
                          <div className="flex items-center text-xs text-muted-foreground mb-2">
                            <Settings className="h-3 w-3 mr-1" />
                            Trigger: {item.trigger.type} {item.trigger.condition} {item.trigger.value}
                          </div>
                        )}
                        {item.scheduledFor && (
                          <div className="flex items-center text-xs text-muted-foreground mb-2">
                            <Clock className="h-3 w-3 mr-1" />
                            Scheduled for: {format(new Date(item.scheduledFor), 'MMM dd, yyyy HH:mm')}
                          </div>
                        )}
                        {item.sentAt && (
                          <div className="flex items-center text-xs text-muted-foreground mb-2">
                            <Calendar className="h-3 w-3 mr-1" />
                            Sent: {format(new Date(item.sentAt), 'MMM dd, yyyy HH:mm')}
                          </div>
                        )}
                      </CardContent>
                      <CardFooter className="justify-between pt-0">
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEdit(item)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => deleteNotificationMutation.mutate(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        {item.status !== 'sent' && (
                          <Button 
                            size="sm" 
                            variant="secondary"
                            onClick={() => handleSendNow(item)}
                          >
                            Send Now
                          </Button>
                        )}
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
