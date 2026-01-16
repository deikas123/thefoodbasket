import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Edit, Trash2, Shield, User, Truck, Package, Headphones, Calculator, Store, ClipboardList } from "lucide-react";
import { toast } from "sonner";
import { getAllRoles, createRole, updateRole, deleteRole, RoleDefinition } from "@/services/roleService";

const iconMap: Record<string, React.ComponentType<any>> = {
  shield: Shield,
  user: User,
  truck: Truck,
  package: Package,
  headphones: Headphones,
  calculator: Calculator,
  store: Store,
  'clipboard-list': ClipboardList
};

const RoleManagement = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleDefinition | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    display_name: '',
    description: '',
    color: '#6B7280',
    icon: 'user'
  });
  
  const queryClient = useQueryClient();
  
  const { data: roles, isLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: getAllRoles
  });
  
  const createMutation = useMutation({
    mutationFn: createRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Role created successfully');
      setIsCreateOpen(false);
      resetForm();
    },
    onError: () => toast.error('Failed to create role')
  });
  
  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<RoleDefinition> }) => 
      updateRole(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Role updated successfully');
      setEditingRole(null);
      resetForm();
    },
    onError: () => toast.error('Failed to update role')
  });
  
  const deleteMutation = useMutation({
    mutationFn: deleteRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Role deleted successfully');
    },
    onError: () => toast.error('Failed to delete role')
  });
  
  const resetForm = () => {
    setFormData({
      name: '',
      display_name: '',
      description: '',
      color: '#6B7280',
      icon: 'user'
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRole) {
      updateMutation.mutate({ id: editingRole.id, updates: formData });
    } else {
      createMutation.mutate(formData);
    }
  };
  
  const handleEdit = (role: RoleDefinition) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      display_name: role.display_name,
      description: role.description || '',
      color: role.color,
      icon: role.icon
    });
  };
  
  const RoleIcon = ({ icon }: { icon: string }) => {
    const IconComponent = iconMap[icon] || User;
    return <IconComponent className="h-4 w-4" />;
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Role Management</CardTitle>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Role
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Role</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Role Key (lowercase, no spaces)</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value.toLowerCase().replace(/\s/g, '_') })}
                  placeholder="e.g., warehouse_manager"
                  required
                />
              </div>
              <div>
                <Label htmlFor="display_name">Display Name</Label>
                <Input
                  id="display_name"
                  value={formData.display_name}
                  onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                  placeholder="e.g., Warehouse Manager"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the role"
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="icon">Icon</Label>
                  <select
                    id="icon"
                    className="w-full border rounded-md p-2"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  >
                    <option value="user">User</option>
                    <option value="shield">Shield</option>
                    <option value="truck">Truck</option>
                    <option value="package">Package</option>
                    <option value="headphones">Headphones</option>
                    <option value="calculator">Calculator</option>
                    <option value="store">Store</option>
                    <option value="clipboard-list">Clipboard</option>
                  </select>
                </div>
              </div>
              <Button type="submit" className="w-full">
                Create Role
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">Loading roles...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles?.map((role) => (
                <TableRow key={role.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div 
                        className="p-1.5 rounded"
                        style={{ backgroundColor: `${role.color}20` }}
                      >
                        <RoleIcon icon={role.icon} />
                      </div>
                      <span className="font-medium">{role.display_name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {role.description || '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={role.is_system_role ? "secondary" : "outline"}>
                      {role.is_system_role ? 'System' : 'Custom'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={role.active ? "default" : "destructive"}>
                      {role.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      {!role.is_system_role && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(role)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteMutation.mutate(role.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        
        {/* Edit Dialog */}
        <Dialog open={!!editingRole} onOpenChange={(open) => !open && setEditingRole(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Role</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="edit_display_name">Display Name</Label>
                <Input
                  id="edit_display_name"
                  value={formData.display_name}
                  onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_description">Description</Label>
                <Input
                  id="edit_description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="edit_color">Color</Label>
                  <Input
                    id="edit_color"
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="edit_icon">Icon</Label>
                  <select
                    id="edit_icon"
                    className="w-full border rounded-md p-2"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  >
                    <option value="user">User</option>
                    <option value="shield">Shield</option>
                    <option value="truck">Truck</option>
                    <option value="package">Package</option>
                    <option value="headphones">Headphones</option>
                    <option value="calculator">Calculator</option>
                    <option value="store">Store</option>
                    <option value="clipboard-list">Clipboard</option>
                  </select>
                </div>
              </div>
              <Button type="submit" className="w-full">
                Update Role
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default RoleManagement;
