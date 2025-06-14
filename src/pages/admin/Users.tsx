
import StaffManagement from "@/components/admin/StaffManagement";

const Users = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Staff Management</h1>
      </div>
      
      <StaffManagement />
    </div>
  );
};

export default Users;
