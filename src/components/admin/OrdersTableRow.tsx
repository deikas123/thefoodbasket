
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Settings, UserPlus } from "lucide-react";
import { Order, OrderStatus } from "@/types/order";
import { formatCurrency } from "@/utils/currencyFormatter";

interface OrdersTableRowProps {
  order: Order;
  onViewOrder: (orderId: string) => void;
  onManageOrder: (order: Order) => void;
  onAssignOrder: (order: Order) => void;
}

const getStatusBadgeVariant = (status: OrderStatus) => {
  switch (status) {
    case "pending":
      return "bg-yellow-50 text-yellow-700 border-yellow-200";
    case "processing":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "dispatched":
      return "bg-indigo-50 text-indigo-700 border-indigo-200";
    case "out_for_delivery":
      return "bg-purple-50 text-purple-700 border-purple-200";
    case "delivered":
      return "bg-green-50 text-green-700 border-green-200";
    case "cancelled":
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
};

const formatDate = (isoDate: string) => {
  return new Date(isoDate).toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const OrdersTableRow = ({
  order,
  onViewOrder,
  onManageOrder,
  onAssignOrder
}: OrdersTableRowProps) => {
  return (
    <TableRow key={order.id}>
      <TableCell className="font-medium">{order.id}</TableCell>
      <TableCell>{formatDate(order.createdAt)}</TableCell>
      <TableCell>
        <div>
          <div>{order.customer?.name || order.deliveryAddress.city}</div>
          <div className="text-sm text-muted-foreground">{order.deliveryAddress.street}</div>
        </div>
      </TableCell>
      <TableCell>{order.items.length}</TableCell>
      <TableCell>{formatCurrency(order.total)}</TableCell>
      <TableCell>
        <Badge variant="outline" className={getStatusBadgeVariant(order.status as OrderStatus)}>
          {order.status.replace('_', ' ')}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => onViewOrder(order.id)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => onAssignOrder(order)}
          >
            <UserPlus className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => onManageOrder(order)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default OrdersTableRow;
