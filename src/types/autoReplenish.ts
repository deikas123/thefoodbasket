
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
}
