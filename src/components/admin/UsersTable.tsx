
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserPlus } from "lucide-react";
import { useUsersData } from "@/hooks/useUsersData";
import { User } from "@/types/user";
import UsersTableRow from "./UsersTableRow";
import UsersSearch from "./UsersSearch";
import UsersTableSkeleton from "./UsersTableSkeleton";

const AdminUsersTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  
  const { data: users, isLoading, error } = useUsersData();
  
  const filteredUsers = users?.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleViewUser = (userId: string) => {
    navigate(`/admin/users/${userId}`);
  };
  
  const handleAddUser = () => {
    navigate("/admin/users/new");
  };
  
  if (error) {
    console.error("Users table error:", error);
  }
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Users Management</CardTitle>
        <Button onClick={handleAddUser}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </CardHeader>
      <CardContent>
        <UsersSearch 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
        
        {isLoading ? (
          <UsersTableSkeleton />
        ) : error ? (
          <div className="text-center py-8 text-red-500">
            Error loading users: {error.message}
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Loyalty Points</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers?.map((user) => (
                  <UsersTableRow 
                    key={user.id}
                    user={user}
                    onViewUser={handleViewUser}
                  />
                ))}
                
                {filteredUsers?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      {searchTerm ? "No users found matching your search" : "No users found"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminUsersTable;
