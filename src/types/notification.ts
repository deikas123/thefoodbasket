
export interface Notification {
  id: string;
  title: string;
  body: string;
  image?: string;
  link?: string;
  sentAt?: string;
  scheduledFor?: string;
  status: 'draft' | 'sent' | 'scheduled';
  trigger?: NotificationTrigger;
  targetUserIds?: string[] | null;
  targetUserRole?: string | null;
  createdAt: string;
}

export interface NotificationTrigger {
  type: 'order_status' | 'product_stock' | 'user_inactivity' | 'abandoned_cart' | 'special_day';
  condition: string;
  value: string;
}
