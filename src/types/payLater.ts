
export interface PayLaterOrder {
  id: string;
  orderId: string;
  userId: string;
  totalAmount: number;
  paidAmount: number;
  dueDate: string;
  status: "active" | "completed" | "overdue";
  createdAt: string;
  updatedAt: string;
}
