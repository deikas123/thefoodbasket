
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAllRedemptions, getAllLoyaltyTransactions, adjustUserPoints, LoyaltyTransaction } from "@/services/loyaltyService";
import { formatCurrency } from "@/utils/currencyFormatter";
import { formatDate } from "@/utils/userUtils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Search, Plus, Minus, ArrowUpRight, ArrowDownRight, Gift, ShoppingCart, UserPlus, Settings } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const LoyaltyRedemptionsTable = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [adjustDialogOpen, setAdjustDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{ id: string; email: string; points: number } | null>(null);
  const [adjustAmount, setAdjustAmount] = useState(0);
  const [adjustReason, setAdjustReason] = useState("");
  const [isDeduction, setIsDeduction] = useState(false);
  const [isAdjusting, setIsAdjusting] = useState(false);
  
  const { data: redemptions = [], isLoading: redemptionsLoading } = useQuery({
    queryKey: ['admin-loyalty-redemptions'],
    queryFn: getAllRedemptions,
  });
  
  const { data: transactions = [], isLoading: transactionsLoading } = useQuery({
    queryKey: ['admin-loyalty-transactions'],
    queryFn: () => getAllLoyaltyTransactions(100),
  });
  
  const { data: usersWithPoints = [] } = useQuery({
    queryKey: ['users-with-points'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name, loyalty_points')
        .gt('loyalty_points', 0)
        .order('loyalty_points', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data || [];
    },
  });
  
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-50 text-green-700 border-green-200';
      case 'pending': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'cancelled': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };
  
  const getTransactionIcon = (source: string) => {
    switch (source) {
      case 'order': return <ShoppingCart className="h-4 w-4" />;
      case 'referral': return <UserPlus className="h-4 w-4" />;
      case 'review': return <Gift className="h-4 w-4" />;
      case 'admin_adjustment': return <Settings className="h-4 w-4" />;
      default: return <Gift className="h-4 w-4" />;
    }
  };
  
  const handleOpenAdjustDialog = (user: { id: string; email: string; loyalty_points: number }) => {
    setSelectedUser({ id: user.id, email: user.email || 'Unknown', points: user.loyalty_points });
    setAdjustAmount(0);
    setAdjustReason("");
    setIsDeduction(false);
    setAdjustDialogOpen(true);
  };
  
  const handleAdjustPoints = async () => {
    if (!selectedUser || adjustAmount <= 0 || !adjustReason.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    
    setIsAdjusting(true);
    try {
      const success = await adjustUserPoints(
        selectedUser.id,
        adjustAmount,
        adjustReason,
        isDeduction
      );
      
      if (success) {
        toast.success(`Successfully ${isDeduction ? 'deducted' : 'added'} ${adjustAmount} points`);
        queryClient.invalidateQueries({ queryKey: ['users-with-points'] });
        queryClient.invalidateQueries({ queryKey: ['admin-loyalty-transactions'] });
        queryClient.invalidateQueries({ queryKey: ['loyalty-stats'] });
        setAdjustDialogOpen(false);
      } else {
        toast.error("Failed to adjust points");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsAdjusting(false);
    }
  };
  
  const filteredUsers = usersWithPoints.filter(user => 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <Tabs defaultValue="users" className="space-y-4">
      <TabsList>
        <TabsTrigger value="users">Users & Points</TabsTrigger>
        <TabsTrigger value="transactions">Transactions</TabsTrigger>
        <TabsTrigger value="redemptions">Redemptions</TabsTrigger>
      </TabsList>
      
      <TabsContent value="users">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>User Points</CardTitle>
                <CardDescription>Manage user loyalty points</CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead className="text-right">Points</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        No users with points found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{user.first_name} {user.last_name}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono font-bold">
                          {user.loyalty_points.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {formatCurrency(user.loyalty_points * 0.1)}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setIsDeduction(false);
                                handleOpenAdjustDialog(user);
                              }}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Add
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setIsDeduction(true);
                                handleOpenAdjustDialog(user);
                              }}
                            >
                              <Minus className="h-3 w-3 mr-1" />
                              Deduct
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="transactions">
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>All loyalty point transactions</CardDescription>
          </CardHeader>
          <CardContent>
            {transactionsLoading ? (
              <div className="text-center py-8">Loading transactions...</div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No transactions found
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Points</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell>{formatDate(tx.created_at)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {tx.transaction_type === 'earned' ? (
                              <ArrowUpRight className="h-4 w-4 text-green-500" />
                            ) : (
                              <ArrowDownRight className="h-4 w-4 text-orange-500" />
                            )}
                            <span className="capitalize">{tx.transaction_type}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getTransactionIcon(tx.source)}
                            <span className="capitalize">{tx.source.replace('_', ' ')}</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {tx.description || '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={tx.transaction_type === 'earned' ? 'text-green-600 font-medium' : 'text-orange-600 font-medium'}>
                            {tx.transaction_type === 'earned' ? '+' : '-'}{tx.points}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="redemptions">
        <Card>
          <CardHeader>
            <CardTitle>Redemption History</CardTitle>
            <CardDescription>Points redeemed for wallet credit</CardDescription>
          </CardHeader>
          <CardContent>
            {redemptionsLoading ? (
              <div className="text-center py-8">Loading redemptions...</div>
            ) : redemptions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No redemptions found
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Points Redeemed</TableHead>
                      <TableHead>KSH Value</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {redemptions.map((redemption) => (
                      <TableRow key={redemption.id}>
                        <TableCell>{formatDate(redemption.created_at)}</TableCell>
                        <TableCell>{redemption.points_redeemed.toLocaleString()}</TableCell>
                        <TableCell>{formatCurrency(redemption.ksh_value)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusBadgeColor(redemption.status)}>
                            {redemption.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
      
      {/* Adjust Points Dialog */}
      <Dialog open={adjustDialogOpen} onOpenChange={setAdjustDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isDeduction ? 'Deduct' : 'Add'} Points
            </DialogTitle>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-medium">{selectedUser.email}</p>
                <p className="text-sm text-muted-foreground">
                  Current balance: {selectedUser.points.toLocaleString()} points
                </p>
              </div>
              
              <div>
                <Label htmlFor="adjust-amount">Points to {isDeduction ? 'Deduct' : 'Add'}</Label>
                <Input
                  id="adjust-amount"
                  type="number"
                  min="1"
                  max={isDeduction ? selectedUser.points : undefined}
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(parseInt(e.target.value) || 0)}
                />
              </div>
              
              <div>
                <Label htmlFor="adjust-reason">Reason</Label>
                <Textarea
                  id="adjust-reason"
                  placeholder="Enter reason for adjustment..."
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                />
              </div>
              
              {adjustAmount > 0 && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm">
                    New balance: <span className="font-bold">
                      {isDeduction 
                        ? (selectedUser.points - adjustAmount).toLocaleString()
                        : (selectedUser.points + adjustAmount).toLocaleString()
                      } points
                    </span>
                  </p>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdjustDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAdjustPoints}
              disabled={isAdjusting || adjustAmount <= 0 || !adjustReason.trim()}
              variant={isDeduction ? "destructive" : "default"}
            >
              {isAdjusting ? "Processing..." : `${isDeduction ? 'Deduct' : 'Add'} ${adjustAmount} Points`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Tabs>
  );
};

export default LoyaltyRedemptionsTable;
