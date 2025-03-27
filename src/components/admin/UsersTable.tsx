
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Eye, Search, UserPlus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { User, UserRole } from "@/types";
import { useNavigate } from "react-router-dom";

// Sample data - would come from an API in a real app
const sampleUsers: User[] = [
  {
    id: "user1",
    email: "john.doe@example.com",
    firstName: "John",
    lastName: "Doe",
    role: "customer",
    addresses: [],
    loyaltyPoints: 120,
    createdAt: "2023-01-15T10:30:00Z",
  },
  {
    id: "user2",
    email: "jane.smith@example.com",
    firstName: "Jane",
    lastName: "Smith",
    role: "customer",
    addresses: [],
    loyaltyPoints: 85,
    createdAt: "2023-03-22T14:20:00Z",
  },
  {
    id: "user3",
    email: "admin@foodbasket.co.ke",
    firstName: "Admin",
    lastName: "User",
    role: "admin",
    addresses: [],
    loyaltyPoints: 0,
    createdAt: "2022-11-10T09:00:00Z",
  },
  {
    id: "user4",
    email: "michael.kamau@example.com",
    firstName: "Michael",
    lastName: "Kamau",
    role: "delivery",
    addresses: [],
    loyaltyPoints: 0,
    createdAt: "2023-05-05T11:30:00Z",
  }
];

const getRoleBadgeVariant = (role: UserRole) => {
  switch (role) {
    case "admin":
      return "bg-purple-50 text-purple-700 border-purple-200";
    case "customer":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "delivery":
      return "bg-green-50 text-green-700 border-green-200";
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

const AdminUsersTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  
  // In a real application, this would fetch data from an API
  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => {
      // This is using mock data, but would be a fetch call in a real app
      return Promise.resolve(sampleUsers);
    }
  });
  
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
        <div className="relative flex-1 max-w-sm mb-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ))}
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
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.firstName} {user.lastName}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getRoleBadgeVariant(user.role)}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(user.createdAt)}</TableCell>
                    <TableCell>{user.loyaltyPoints}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleViewUser(user.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                
                {filteredUsers?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      No users found
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
