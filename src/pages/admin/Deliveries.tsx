
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import AdminDeliveriesTable from "@/components/admin/DeliveriesTable";

const Deliveries = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Deliveries Management</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>All Deliveries</CardTitle>
        </CardHeader>
        <div className="p-6">
          <AdminDeliveriesTable />
        </div>
      </Card>
    </div>
  );
};

export default Deliveries;
