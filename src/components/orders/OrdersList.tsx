
import { Order } from "@/types";
import OrderCard from "./OrderCard";

interface OrdersListProps {
  orders: Order[];
  onViewOrder: (orderId: string) => void;
}

const OrdersList = ({ orders, onViewOrder }: OrdersListProps) => {
  return (
    <div className="space-y-6">
      {orders.map((order) => (
        <OrderCard 
          key={order.id} 
          order={order} 
          onViewOrder={onViewOrder}
        />
      ))}
    </div>
  );
};

export default OrdersList;
