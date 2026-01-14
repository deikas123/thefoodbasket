
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import AdminOrdersTable from "@/components/admin/OrdersTable";
import OrderFlowOverview from "@/components/admin/OrderFlowOverview";

const Orders = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Orders Management</h1>
      </div>
      
      {/* Order Flow Pipeline */}
      <OrderFlowOverview />
      
      <Card>
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
        </CardHeader>
        <div className="p-6">
          <AdminOrdersTable />
        </div>
      </Card>
    </div>
  );
};

export default Orders;
