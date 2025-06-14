
interface OrdersHeaderProps {
  ordersCount: number;
  onBrowseProducts: () => void;
}

const OrdersHeader = ({ ordersCount, onBrowseProducts }: OrdersHeaderProps) => {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold">My Orders</h1>
      <p className="text-muted-foreground mt-2">
        View and track your orders
        {ordersCount > 0 && ` (${ordersCount} orders)`}
      </p>
    </div>
  );
};

export default OrdersHeader;
