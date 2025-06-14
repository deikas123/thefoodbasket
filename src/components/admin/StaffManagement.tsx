
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { UserRole } from "@/types/supabase";
import StaffCreationDialog from "./StaffCreationDialog";

interface StaffMember {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  createdAt: string;
}

const StaffManagement = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch all staff members
  const { data: staffMembers, isLoading, error } = useQuery({
    queryKey: ["staff-members"],
    queryFn: async () => {
      console.log("Fetching staff members...");
      
      try {
        // First, get all user roles that are not customers
        const { data: userRoles, error: rolesError } = await supabase
          .from('user_roles')
          .select('user_id, role')
          .neq('role', 'customer');
          
        if (rolesError) {
          console.error("Error fetching user roles:", rolesError);
          throw rolesError;
        }
        
        console.log("User roles found:", userRoles);
        
        if (!userRoles || userRoles.length === 0) {
          console.log("No staff roles found");
          return [];
        }
        
        // Get user IDs for staff members
        const staffUserIds = userRoles.map(role => role.user_id);
        
        // Fetch profiles for these users
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name')
          .in('id', staffUserIds);
          
        if (profilesError) {
          console.error("Error fetching profiles:", profilesError);
          throw profilesError;
        }
        
        console.log("Profiles found:", profiles);
        
        // Combine the data
        const staffData: StaffMember[] = userRoles.map((roleData) => {
          const profile = profiles?.find(p => p.id === roleData.user_id);
          return {
            id: roleData.user_id,
            email: `${profile?.first_name?.toLowerCase() || 'user'}@foodbasket.com`, // Placeholder email
            firstName: profile?.first_name || 'Unknown',
            lastName: profile?.last_name || 'User',
            role: roleData.role as UserRole,
            createdAt: new Date().toISOString() // Placeholder date
          };
        });
        
        console.log("Final staff data:", staffData);
        return staffData;
      } catch (error) {
        console.error("Error in staff query:", error);
        throw error;
      }
    }
  });

  // Delete staff member mutation
  const deleteStaffMutation = useMutation({
    mutationFn: async (staffId: string) => {
      console.log("Deleting staff member:", staffId);
      
      // Remove the role assignment
      const { error: roleError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', staffId);
        
      if (roleError) {
        console.error("Error removing role:", roleError);
        throw roleError;
      }
      
      console.log("Staff member role removed successfully");
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Staff member removed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["staff-members"] });
    },
    onError: (error: any) => {
      console.error("Delete staff error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove staff member",
        variant: "destructive",
      });
    }
  });

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'bg-red-50 text-red-700 border-red-200';
      case 'customer_service': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'order_fulfillment': return 'bg-green-50 text-green-700 border-green-200';
      case 'delivery': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'accountant': return 'bg-purple-50 text-purple-700 border-purple-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const formatRoleName = (role: UserRole) => {
    switch (role) {
      case 'customer_service': return 'Customer Service';
      case 'order_fulfillment': return 'Order Fulfillment';
      case 'delivery': return 'Delivery';
      case 'accountant': return 'Accountant';
      case 'admin': return 'Admin';
      default: return role;
    }
  };

  if (error) {
    console.error("Staff management error:", error);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Staff Management</CardTitle>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Staff Member
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading staff members...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              Error loading staff members: {error.message}
            </div>
          ) : staffMembers?.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No staff members found
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staffMembers?.map((staff) => (
                    <TableRow key={staff.id}>
                      <TableCell className="font-medium">
                        {staff.firstName} {staff.lastName}
                      </TableCell>
                      <TableCell>{staff.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getRoleBadgeColor(staff.role)}>
                          {formatRoleName(staff.role)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Active
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => deleteStaffMutation.mutate(staff.id)}
                            disabled={deleteStaffMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <StaffCreationDialog 
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
      />
    </div>
  );
};

export default StaffManagement;
