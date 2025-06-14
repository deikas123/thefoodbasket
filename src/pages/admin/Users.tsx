
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import AdminUsersTable from "@/components/admin/UsersTable";

const Users = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Users Management</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <div className="p-6">
          <AdminUsersTable />
        </div>
      </Card>
    </div>
  );
};

export default Users;
