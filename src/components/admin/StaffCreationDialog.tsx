
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/types/supabase";
import { Search, UserPlus, Users } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface StaffCreationDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ExistingUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

const StaffCreationDialog = ({ isOpen, onClose }: StaffCreationDialogProps) => {
  const [activeTab, setActiveTab] = useState<"existing" | "new">("existing");
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: '' as UserRole
  });
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("" as UserRole);
  const [userSearch, setUserSearch] = useState("");
  const queryClient = useQueryClient();

  // Fetch existing users who are not already staff
  const { data: existingUsers, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["non-staff-users"],
    queryFn: async () => {
      // Get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name')
        .order('created_at', { ascending: false });
        
      if (profilesError) throw profilesError;

      // Get existing staff user IDs
      const { data: staffRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .neq('role', 'customer');
        
      if (rolesError) throw rolesError;

      const staffUserIds = new Set(staffRoles?.map(r => r.user_id) || []);

      // Filter out users who already have staff roles
      const nonStaffUsers: ExistingUser[] = (profiles || [])
        .filter(p => !staffUserIds.has(p.id))
        .map(p => ({
          id: p.id,
          email: p.email || `user-${p.id.substring(0, 6)}@example.com`,
          firstName: p.first_name || 'Unknown',
          lastName: p.last_name || 'User'
        }));

      return nonStaffUsers;
    },
    enabled: isOpen
  });

  // Filter users based on search
  const filteredUsers = existingUsers?.filter(user => 
    user.firstName.toLowerCase().includes(userSearch.toLowerCase()) ||
    user.lastName.toLowerCase().includes(userSearch.toLowerCase()) ||
    user.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  // Assign role to existing user
  const assignRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: UserRole }) => {
      // First check if user already has a role entry
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (existingRole) {
        // Update existing role
        const { error } = await supabase
          .from('user_roles')
          .update({ role })
          .eq('user_id', userId);
        if (error) throw error;
      } else {
        // Insert new role
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Staff role assigned successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["staff-members"] });
      queryClient.invalidateQueries({ queryKey: ["non-staff-users"] });
      setSelectedUserId("");
      setSelectedRole("" as UserRole);
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to assign role. Please try again.",
        variant: "destructive",
      });
    }
  });

  const createStaffMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No active session found. Please log in again.');
      }

      const { data: result, error } = await supabase.functions.invoke('create-staff', {
        body: {
          email: data.email,
          password: data.password,
          firstName: data.firstName,
          lastName: data.lastName,
          role: data.role
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw new Error(error.message || 'Failed to create staff member');
      if (result?.error) throw new Error(result.error);
      if (!result?.success) throw new Error('Failed to create staff member - no success response');

      return result.user;
    },
    onSuccess: (createdUser) => {
      toast({
        title: "Success",
        description: `Staff member ${createdUser.firstName} ${createdUser.lastName} created successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ["staff-members"] });
      setFormData({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        role: '' as UserRole
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to create staff member. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleNewStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password || !formData.firstName || !formData.lastName || !formData.role) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    createStaffMutation.mutate(formData);
  };

  const handleAssignRole = () => {
    if (!selectedUserId || !selectedRole) {
      toast({
        title: "Error",
        description: "Please select a user and role",
        variant: "destructive",
      });
      return;
    }
    assignRoleMutation.mutate({ userId: selectedUserId, role: selectedRole });
  };

  const staffRoles: { value: UserRole; label: string }[] = [
    { value: 'customer_service', label: 'Customer Service' },
    { value: 'order_fulfillment', label: 'Order Fulfillment' },
    { value: 'delivery', label: 'Delivery' },
    { value: 'accountant', label: 'Accountant' },
    { value: 'admin', label: 'Admin' }
  ];

  const selectedUser = existingUsers?.find(u => u.id === selectedUserId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Staff Member</DialogTitle>
          <DialogDescription>
            Assign a role to an existing user or create a new staff account.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "existing" | "new")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="existing" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Existing User
            </TabsTrigger>
            <TabsTrigger value="new" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              New Account
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="existing" className="space-y-4 mt-4">
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users by name or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              {/* User List */}
              <div className="border rounded-lg">
                <ScrollArea className="h-[200px]">
                  {isLoadingUsers ? (
                    <div className="p-4 text-center text-muted-foreground">Loading users...</div>
                  ) : filteredUsers?.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      {userSearch ? "No users match your search" : "No available users found"}
                    </div>
                  ) : (
                    <div className="divide-y">
                      {filteredUsers?.map((user) => (
                        <button
                          key={user.id}
                          type="button"
                          onClick={() => setSelectedUserId(user.id)}
                          className={`w-full p-3 text-left hover:bg-muted/50 transition-colors ${
                            selectedUserId === user.id ? 'bg-primary/10 border-l-2 border-primary' : ''
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                              <span className="text-primary font-semibold text-sm">
                                {user.firstName[0]}{user.lastName[0]}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium truncate">{user.firstName} {user.lastName}</p>
                              <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>

              {/* Selected User Display */}
              {selectedUser && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Selected:</p>
                  <p className="font-medium">{selectedUser.firstName} {selectedUser.lastName}</p>
                </div>
              )}
              
              {/* Role Selection */}
              <div className="space-y-2">
                <Label>Assign Role</Label>
                <Select 
                  value={selectedRole} 
                  onValueChange={(value: UserRole) => setSelectedRole(value)}
                  disabled={assignRoleMutation.isPending}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {staffRoles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Actions */}
              <div className="flex justify-end gap-2 pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onClose}
                  disabled={assignRoleMutation.isPending}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleAssignRole}
                  disabled={!selectedUserId || !selectedRole || assignRoleMutation.isPending}
                >
                  {assignRoleMutation.isPending ? "Assigning..." : "Assign Role"}
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="new" className="mt-4">
            <form onSubmit={handleNewStaffSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                    disabled={createStaffMutation.isPending}
                    placeholder="Enter first name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                    disabled={createStaffMutation.isPending}
                    placeholder="Enter last name"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={createStaffMutation.isPending}
                  placeholder="Enter email address"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                  disabled={createStaffMutation.isPending}
                  placeholder="Enter password (min 6 characters)"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select 
                  value={formData.role} 
                  onValueChange={(value: UserRole) => setFormData({ ...formData, role: value })}
                  disabled={createStaffMutation.isPending}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {staffRoles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end gap-2 pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onClose} 
                  disabled={createStaffMutation.isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createStaffMutation.isPending}>
                  {createStaffMutation.isPending ? "Creating..." : "Create Staff"}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default StaffCreationDialog;
