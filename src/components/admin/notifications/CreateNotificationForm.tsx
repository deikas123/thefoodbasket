
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createNotification } from "@/services/notificationService";
import { toast } from "@/hooks/use-toast";
import { Plus, Send } from "lucide-react";

const CreateNotificationForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    status: 'draft',
    targetUserRole: '',
    image: '',
    link: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await createNotification({
        title: formData.title,
        body: formData.body,
        status: formData.status as 'draft' | 'sent' | 'scheduled',
        targetUserRole: formData.targetUserRole || null,
        image: formData.image || null,
        link: formData.link || null,
        scheduledFor: null,
        sentAt: null,
        targetUserIds: null,
        trigger: null
      } as any);

      toast({
        title: "Success",
        description: "Notification created successfully",
      });

      setFormData({
        title: '',
        body: '',
        status: 'draft',
        targetUserRole: '',
        image: '',
        link: ''
      });

      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create notification",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Create New Notification
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Notification title"
              required
            />
          </div>

          <div>
            <Label htmlFor="body">Message</Label>
            <Textarea
              id="body"
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              placeholder="Notification message"
              required
            />
          </div>

          <div>
            <Label htmlFor="targetUserRole">Target Audience</Label>
            <Select value={formData.targetUserRole} onValueChange={(value) => setFormData({ ...formData, targetUserRole: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select target audience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Users</SelectItem>
                <SelectItem value="customer">Customers</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
                <SelectItem value="delivery">Delivery Staff</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Save as Draft</SelectItem>
                <SelectItem value="sent">Send Immediately</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="image">Image URL (optional)</Label>
            <Input
              id="image"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div>
            <Label htmlFor="link">Action Link (optional)</Label>
            <Input
              id="link"
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              placeholder="/path/to/action"
            />
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              "Creating..."
            ) : (
              <>
                {formData.status === 'sent' ? <Send className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                {formData.status === 'sent' ? 'Create & Send' : 'Save Draft'}
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateNotificationForm;
