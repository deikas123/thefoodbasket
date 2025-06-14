
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Eye, Search, UserPlus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { UserRole } from "@/types/supabase";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  loyaltyPoints: number;
  createdAt: string;
}

const getRoleBadgeVariant = (role: UserRole) => {
  switch (role) {
    case "admin":
      return "bg-purple-50 text-purple-700 border-purple-200";
    case "customer":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "delivery":
      return "bg-green-50 text-green-700 border-green-200";
    case "customer_service":
      return "bg-orange-50 text-orange-700 border-orange-200";
    case "order_fulfillment":
      return "bg-indigo-50 text-indigo-700 border-indigo-200";
    case "accountant":
      return "bg-pink-50 text-pink-700 border-pink-200";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
};

const formatRoleName = (role: UserRole) => {
  switch (role) {
    case 'customer_service': return 'Customer Service';
    case 'order_fulfillment': return 'Order Fulfillment';
    case 'delivery': return 'Delivery';
    case 'accountant': return 'Accountant';
    case 'admin': return 'Admin';
    case 'customer': return 'Customer';
    default: return role;
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
  
  // Fetch all users from the database
  const { data: users, isLoading, error } = useQuery({
    queryKey: ["admin-all-users"],
    queryFn: async () => {
      console.log("Fetching all users for admin...");
      
      try {
        // Get all profiles
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (profilesError) {
          console.error("Error fetching profiles:", profilesError);
          throw profilesError;
        }
        
        console.log("Profiles found:", profiles);
        
        if (!profiles || profiles.length === 0) {
          console.log("No profiles found");
          return [];
        }
        
        // Get all user roles
        const { data: userRoles, error: rolesError } = await supabase
          .from('user_roles')
          .select('user_id, role');
          
        if (rolesError) {
          console.error("Error fetching user roles:", rolesError);
        }
        
        console.log("User roles found:", userRoles);
        
        // Create a map of roles by user_id for quick lookup
        const roleMap = new Map();
        if (userRoles) {
          userRoles.forEach(r => roleMap.set(r.user_id, r.role));
        }
        
        // Combine the data
        const userData: User[] = profiles.map((profile) => {
          const role = roleMap.get(profile.id) || 'customer';
          
          return {
            id: profile.id,
            email: `${profile.first_name?.toLowerCase() || 'user'}@foodbasket.com`, // Placeholder email
            firstName: profile.first_name || 'Unknown',
            lastName: profile.last_name || 'User',
            role: role as UserRole,
            loyaltyPoints: profile.loyalty_points || 0,
            createdAt: profile.created_at
          };
        });
        
        console.log("Final user data:", userData);
        return userData;
      } catch (error) {
        console.error("Error in users query:", error);
        throw error;
      }
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
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.firstName} {user.lastName}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getRoleBadgeVariant(user.role)}>
                        {formatRoleName(user.role)}
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
