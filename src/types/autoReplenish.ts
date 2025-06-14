
export interface AutoReplenishItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  frequency_days: number;
  next_order_date: string;
  last_order_date?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
  custom_days?: string[];
  custom_time?: string;
}
