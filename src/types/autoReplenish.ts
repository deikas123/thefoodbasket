
export interface AutoReplenishItem {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  frequencyDays: number;
  nextOrderDate: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  custom_days?: string[];
  custom_time?: string;
}
