import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { RefreshCw, Users, Package, Calendar, Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface AutoReplenishAdminItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  frequency_days: number;
  next_order_date: string;
  active: boolean;
  custom_days?: string[];
  custom_time?: string;
  // Join data
  user_email?: string;
  product_name?: string;
  product_image?: string;
}

const AdminAutoReplenish = () => {
  const [items, setItems] = useState<AutoReplenishAdminItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processing, setProcessingItem] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      // Fetch auto replenish items first
      const { data: autoReplenishData, error: autoReplenishError } = await supabase
        .from('auto_replenish_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (autoReplenishError) throw autoReplenishError;

      if (!autoReplenishData || autoReplenishData.length === 0) {
        setItems([]);
        return;
      }

      // Get unique product IDs and user IDs
      const productIds = [...new Set(autoReplenishData.map(item => item.product_id))];
      const userIds = [...new Set(autoReplenishData.map(item => item.user_id))];

      // Fetch products data
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('id, name, image')
        .in('id', productIds);

      if (productsError) throw productsError;

      // Create products map
      const productsMap = new Map();
      productsData?.forEach(product => {
        productsMap.set(product.id, product);
      });

      // For user emails, we'll use user IDs as placeholders since we can't access auth.users directly
      const usersMap = new Map();
      userIds.forEach(userId => {
        usersMap.set(userId, `user-${userId.slice(0, 8)}`);
      });

      // Combine the data
      const formattedItems = autoReplenishData.map(item => ({
        ...item,
        user_email: usersMap.get(item.user_id) || `user-${item.user_id.slice(0, 8)}`,
        product_name: productsMap.get(item.product_id)?.name || 'Unknown Product',
        product_image: productsMap.get(item.product_id)?.image || null,
      }));

      setItems(formattedItems);
    } catch (error) {
      console.error('Error fetching auto replenish items:', error);
      toast({
        title: "Error",
        description: "Failed to load auto replenish items",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProcessAllOrders = async () => {
    setIsProcessing(true);
    try {
      const { error } = await supabase.functions.invoke('process-auto-replenish');
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Auto replenish orders processed successfully",
      });
      
      // Refresh the data
      fetchItems();
    } catch (error) {
      console.error('Error processing orders:', error);
      toast({
        title: "Error", 
        description: "Failed to process auto replenish orders",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleStatus = async (item: AutoReplenishAdminItem) => {
    setProcessingItem(prev => ({ ...prev, [item.id]: true }));
    try {
      const newStatus = !item.active;
      const { error } = await supabase
        .from('auto_replenish_items')
        .update({ active: newStatus })
        .eq('id', item.id);

      if (error) throw error;

      // Update local state
      setItems(prev => 
        prev.map(i => i.id === item.id ? { ...i, active: newStatus } : i)
      );

      toast({
        title: newStatus ? "Activated" : "Paused",
        description: `Auto replenish ${newStatus ? 'activated' : 'paused'} for ${item.product_name}`,
      });
    } catch (error) {
      console.error('Error toggling status:', error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    } finally {
      setProcessingItem(prev => ({ ...prev, [item.id]: false }));
    }
  };

  const formatSchedule = (item: AutoReplenishAdminItem) => {
    if (item.custom_days && item.custom_days.length > 0) {
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const days = item.custom_days.map(d => dayNames[parseInt(d)]).join(', ');
      return `${days} at ${item.custom_time || '09:00'}`;
    }
    return `Every ${item.frequency_days} days at ${item.custom_time || '09:00'}`;
  };

  const activeCount = items.filter(item => item.active).length;
  const totalCount = items.length;

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
        <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <RefreshCw className="mr-2 h-6 w-6" />
            Auto Replenish Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage all user auto replenish subscriptions
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={fetchItems} variant="outline" disabled={isLoading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleProcessAllOrders} disabled={isProcessing}>
            <Play className="h-4 w-4 mr-2" />
            {isProcessing ? "Processing..." : "Process Orders"}
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subscriptions</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(items.map(item => item.user_id)).size}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Auto Replenish Items Table */}
      <Card>
        <CardHeader>
          <CardTitle>Auto Replenish Subscriptions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {items.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Schedule</TableHead>
                    <TableHead>Next Order</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{item.user_email}</p>
                          <p className="text-xs text-muted-foreground">{item.user_id.slice(0, 8)}...</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded bg-muted/30 mr-3 overflow-hidden">
                            {item.product_image && (
                              <img 
                                src={item.product_image} 
                                alt={item.product_name}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{item.product_name}</p>
                            <p className="text-xs text-muted-foreground">{item.product_id.slice(0, 8)}...</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>
                        <span className="text-sm">{formatSchedule(item)}</span>
                      </TableCell>
                      <TableCell>
                        {format(new Date(item.next_order_date), "MMM d, yyyy 'at' HH:mm")}
                      </TableCell>
                      <TableCell>
                        <Badge className={item.active ? "bg-green-500" : "bg-gray-500"}>
                          {item.active ? "Active" : "Paused"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Switch
                          checked={item.active}
                          onCheckedChange={() => handleToggleStatus(item)}
                          disabled={!!processing[item.id]}
                          title={item.active ? "Pause" : "Activate"}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="py-12 text-center">
              <RefreshCw className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Auto Replenish Items</h3>
              <p className="text-muted-foreground">
                No users have set up auto replenish subscriptions yet
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAutoReplenish;