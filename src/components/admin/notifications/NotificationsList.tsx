
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getNotifications, sendPushNotification, deleteNotification } from "@/services/notificationService";
import { formatDate } from "@/utils/userUtils";
import { Bell, Send, Clock, CheckCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";

const NotificationsList = () => {
  const queryClient = useQueryClient();
  
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['admin-notifications'],
    queryFn: getNotifications,
  });

  const sendNotificationMutation = useMutation({
    mutationFn: sendPushNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
      toast.success("Notification sent successfully!");
    },
    onError: (error: any) => {
      toast.error(`Failed to send notification: ${error.message}`);
    }
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
      toast.success("Notification deleted successfully!");
    },
    onError: (error: any) => {
      toast.error(`Failed to delete notification: ${error.message}`);
    }
  });

  const handleSendNotification = (notification: any) => {
    sendNotificationMutation.mutate(notification);
  };

  const handleDeleteNotification = (notificationId: string) => {
    if (confirm("Are you sure you want to delete this notification?")) {
      deleteNotificationMutation.mutate(notificationId);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'scheduled': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'draft': return <Bell className="h-4 w-4 text-gray-500" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-50 text-green-700 border-green-200';
      case 'scheduled': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'draft': return 'bg-gray-50 text-gray-700 border-gray-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Notifications...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          All Notifications
        </CardTitle>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No notifications found</p>
            <p className="text-sm">Create your first notification to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div key={notification.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(notification.status)}
                      <h3 className="font-medium">{notification.title}</h3>
                      <Badge variant="outline" className={getStatusColor(notification.status)}>
                        {notification.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{notification.body}</p>
                    <div className="text-xs text-gray-500">
                      Created: {formatDate(notification.createdAt)}
                      {notification.sentAt && (
                        <span className="ml-4">
                          Sent: {formatDate(notification.sentAt)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {notification.status === 'draft' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleSendNotification(notification)}
                        disabled={sendNotificationMutation.isPending}
                      >
                        <Send className="h-4 w-4 mr-1" />
                        {sendNotificationMutation.isPending ? 'Sending...' : 'Send'}
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => handleDeleteNotification(notification.id)}
                      disabled={deleteNotificationMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationsList;
