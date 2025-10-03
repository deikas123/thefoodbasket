
import React, { useState, useMemo } from 'react';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Order } from "@/types/order";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useUsersData } from "@/hooks/useUsersData";
import { User, Package, Clock } from "lucide-react";
import { formatCurrency } from "@/utils/currencyFormatter";

interface OrderAssignmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  onOrderUpdate: (updatedOrder: Order) => void;
}

const OrderAssignmentDialog: React.FC<OrderAssignmentDialogProps> = ({
  isOpen,
  onClose,
  order,
  onOrderUpdate
}) => {
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [isAssigning, setIsAssigning] = useState(false);
  const queryClient = useQueryClient();

  // Fetch all users data
  const { data: users = [], isLoading } = useUsersData();

  // Filter for staff members with appropriate roles
  const staffMembers = useMemo(() => {
    return users.filter(user => 
      user.role && ['order_fulfillment', 'delivery', 'customer_service'].includes(user.role)
    );
  }, [users]);

  // Assign order mutation
  const assignOrderMutation = useMutation({
    mutationFn: async (staffId: string) => {
      const { data, error } = await supabase
        .from('orders')
        .update({ assigned_to: staffId })
        .eq('id', order.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "Order assigned successfully",
        description: `Order has been assigned to the selected staff member.`,
      });
      
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      
      // Update the order with the new assignment
      if (data) {
        const updatedOrder = {
          ...order,
          assignedTo: data.assigned_to
        };
        onOrderUpdate(updatedOrder);
      }
      
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to assign order",
        description: error.message || "There was an error assigning the order. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAssignment = () => {
    if (!selectedStaffId) {
      toast({
        title: "No Staff Selected",
        description: "Please select a staff member to assign the order to",
        variant: "destructive",
      });
      return;
    }

    setIsAssigning(true);
    assignOrderMutation.mutate(selectedStaffId);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'order_fulfillment': return 'bg-green-50 text-green-700 border-green-200';
      case 'delivery': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'customer_service': return 'bg-blue-50 text-blue-700 border-blue-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const formatRoleName = (role: string) => {
    switch (role) {
      case 'order_fulfillment': return 'Order Fulfillment';
      case 'delivery': return 'Delivery';
      case 'customer_service': return 'Customer Service';
      default: return role;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Assign Order {order.id.slice(-6)}
          </DialogTitle>
          <DialogDescription>
            Assign this order to a staff member for processing
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Order Summary */}
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Order Details</span>
              <Badge variant="outline">
                {order.status.replace('_', ' ')}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Total: </span>
                <span className="font-medium">{formatCurrency(order.total)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Items: </span>
                <span className="font-medium">{order.items.length}</span>
              </div>
              <div className="col-span-2 flex items-center">
                <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                <span className="text-muted-foreground">{order.estimatedDelivery}</span>
              </div>
            </div>
          </div>

          {/* Staff Selection */}
          <div className="space-y-3">
            <Label htmlFor="staff-select">Select Staff Member</Label>
            {isLoading ? (
              <div className="text-center py-4 text-muted-foreground">
                Loading staff members...
              </div>
            ) : (
              <Select value={selectedStaffId} onValueChange={setSelectedStaffId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a staff member" />
                </SelectTrigger>
                <SelectContent>
                  {staffMembers.map((staff) => (
                    <SelectItem key={staff.id} value={staff.id}>
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>{`${staff.firstName} ${staff.lastName}`.trim() || staff.email}</span>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={`ml-2 ${getRoleBadgeColor(staff.role || '')}`}
                        >
                          {formatRoleName(staff.role || '')}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                  {staffMembers.length === 0 && (
                    <SelectItem value="none" disabled>
                      No staff members available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleAssignment}
            disabled={isAssigning || !selectedStaffId || assignOrderMutation.isPending}
          >
            {isAssigning || assignOrderMutation.isPending ? "Assigning..." : "Assign Order"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderAssignmentDialog;
