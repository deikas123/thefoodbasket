
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/types/supabase";
import { assignUserRole } from "@/services/roleService";

interface StaffCreationDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const StaffCreationDialog = ({ isOpen, onClose }: StaffCreationDialogProps) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: '' as UserRole
  });
  const queryClient = useQueryClient();

  const createStaffMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      console.log('Creating staff member:', data);
      
      try {
        // Create the user account using admin API
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: data.email,
          password: data.password,
          email_confirm: true, // Auto-confirm email for staff
          user_metadata: {
            first_name: data.firstName,
            last_name: data.lastName,
            role: data.role
          }
        });

        if (authError) {
          console.error('Auth creation error:', authError);
          throw new Error(authError.message || 'Failed to create user account');
        }

        if (!authData.user) {
          throw new Error("Failed to create user - no user data returned");
        }

        console.log('User created:', authData.user.id);

        // Create the profile
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: authData.user.id,
            first_name: data.firstName,
            last_name: data.lastName
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
          // Continue anyway as this is not critical
        }

        // Assign the role to the new user
        try {
          await assignUserRole(authData.user.id, data.role);
          console.log('Role assigned successfully:', data.role);
        } catch (roleError) {
          console.error('Role assignment error:', roleError);
          throw new Error('Failed to assign role to user');
        }

        return authData.user;
      } catch (error: any) {
        console.error('Staff creation failed:', error);
        throw error;
      }
    },
    onSuccess: () => {
      console.log('Staff creation successful');
      toast({
        title: "Success",
        description: "Staff member created successfully.",
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
      console.error('Staff creation error in onError:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to create staff member. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.email || !formData.password || !formData.firstName || !formData.lastName || !formData.role) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    // Password validation
    if (formData.password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    console.log('Submitting staff creation form:', { ...formData, password: '[REDACTED]' });
    createStaffMutation.mutate(formData);
  };

  const staffRoles: { value: UserRole; label: string }[] = [
    { value: 'customer_service', label: 'Customer Service' },
    { value: 'order_fulfillment', label: 'Order Fulfillment' },
    { value: 'delivery', label: 'Delivery' },
    { value: 'accountant', label: 'Accountant' },
    { value: 'admin', label: 'Admin' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Staff Member</DialogTitle>
          <DialogDescription>
            Create a new staff account with specific role permissions.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
                disabled={createStaffMutation.isPending}
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
          
          <DialogFooter>
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
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StaffCreationDialog;
