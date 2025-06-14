
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Order } from "@/types/order";
import { useNavigate } from "react-router-dom";
import { getAllOrders } from "@/services/orderService";
import { convertToOrders } from "@/utils/typeConverters";
import OrderManagementDialog from "./OrderManagementDialog";
import OrderAssignmentDialog from "./OrderAssignmentDialog";
import OrdersTableHeader from "./OrdersTableHeader";
import OrdersTableSkeleton from "./OrdersTableSkeleton";
import OrdersTableRow from "./OrdersTableRow";

const AdminOrdersTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isManagementDialogOpen, setIsManagementDialogOpen] = useState(false);
  const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const { data: orderTypes, isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: getAllOrders
  });
  
  const orders = orderTypes ? convertToOrders(orderTypes) : [];
  
  const filteredOrders = orders?.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.deliveryAddress.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.deliveryAddress.street.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  const handleViewOrder = (orderId: string) => {
    navigate(`/admin/orders/${orderId}`);
  };

  const handleManageOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsManagementDialogOpen(true);
  };

  const handleAssignOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsAssignmentDialogOpen(true);
  };

  const handleOrderUpdate = (updatedOrder: Order) => {
    queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    setSelectedOrder(null);
  };
  
  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Orders Management</CardTitle>
        </CardHeader>
        <CardContent>
          <OrdersTableHeader
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
          />
          
          {isLoading ? (
            <OrdersTableSkeleton />
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders?.map((order) => (
                    <OrdersTableRow
                      key={order.id}
                      order={order}
                      onViewOrder={handleViewOrder}
                      onManageOrder={handleManageOrder}
                      onAssignOrder={handleAssignOrder}
                    />
                  ))}
                  
                  {filteredOrders?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        No orders found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedOrder && (
        <>
          <OrderManagementDialog
            isOpen={isManagementDialogOpen}
            onClose={() => {
              setIsManagementDialogOpen(false);
              setSelectedOrder(null);
            }}
            order={selectedOrder}
            onOrderUpdate={handleOrderUpdate}
          />
          
          <OrderAssignmentDialog
            isOpen={isAssignmentDialogOpen}
            onClose={() => {
              setIsAssignmentDialogOpen(false);
              setSelectedOrder(null);
            }}
            order={selectedOrder}
            onOrderUpdate={handleOrderUpdate}
          />
        </>
      )}
    </>
  );
};

export default AdminOrdersTable;
