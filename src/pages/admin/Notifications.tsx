
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NotificationsList from "@/components/admin/notifications/NotificationsList";
import CreateNotificationForm from "@/components/admin/notifications/CreateNotificationForm";
import { useQueryClient } from "@tanstack/react-query";

const Notifications = () => {
  const queryClient = useQueryClient();

  const handleNotificationCreated = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Notifications Management</h1>
        <p className="text-muted-foreground">
          Create and manage push notifications for your users
        </p>
      </div>

      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">All Notifications</TabsTrigger>
          <TabsTrigger value="create">Create New</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <NotificationsList />
        </TabsContent>

        <TabsContent value="create">
          <CreateNotificationForm onSuccess={handleNotificationCreated} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Notifications;
