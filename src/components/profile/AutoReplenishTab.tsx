import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUserAutoReplenishItems, toggleAutoReplenishStatus, removeFromAutoReplenish } from "@/services/autoReplenishService";
import { getProductById } from "@/services/productService";
import { AutoReplenishItem } from "@/types/autoReplenish";
import { Product } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { 
  RefreshCw,
  Trash2,
  Clock,
  ExternalLink,
  PlusCircle
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { format, isAfter } from "date-fns";

const AutoReplenishTab = () => {
  const navigate = useNavigate();
  const [autoReplenishItems, setAutoReplenishItems] = useState<AutoReplenishItem[]>([]);
  const [products, setProducts] = useState<{[key: string]: Product}>({});
  const [isLoading, setIsLoading] = useState(true);
  const [processing, setProcessing] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    const fetchItems = async () => {
      setIsLoading(true);
      try {
        // Get auto replenish items
        const items = await getUserAutoReplenishItems();
        setAutoReplenishItems(items);
        
        // Fetch product details for each item
        const productMap: {[key: string]: Product} = {};
        for (const item of items) {
          const product = await getProductById(item.productId);
          if (product) {
            productMap[item.productId] = product;
          }
        }
        setProducts(productMap);
      } catch (error) {
        console.error("Error fetching auto replenish items:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchItems();
  }, []);
  
  const handleToggleStatus = async (item: AutoReplenishItem) => {
    setProcessing(prev => ({ ...prev, [item.id]: true }));
    try {
      const newStatus = !item.active;
      const success = await toggleAutoReplenishStatus(item.id, newStatus);
      
      if (success) {
        // Update local state
        setAutoReplenishItems(prev => 
          prev.map(i => i.id === item.id ? { ...i, active: newStatus } : i)
        );
        
        toast({
          title: newStatus ? "Auto-Replenish Activated" : "Auto-Replenish Paused",
          description: newStatus 
            ? "The item will be automatically ordered according to schedule" 
            : "The item will not be automatically ordered until reactivated",
        });
      }
    } catch (error) {
      console.error("Error toggling status:", error);
    } finally {
      setProcessing(prev => ({ ...prev, [item.id]: false }));
    }
  };
  
  const handleRemoveItem = async (item: AutoReplenishItem) => {
    setProcessing(prev => ({ ...prev, [item.id]: true }));
    try {
      const success = await removeFromAutoReplenish(item.id);
      
      if (success) {
        // Update local state
        setAutoReplenishItems(prev => prev.filter(i => i.id !== item.id));
        
        toast({
          title: "Item Removed",
          description: "The item has been removed from auto-replenish",
        });
      }
    } catch (error) {
      console.error("Error removing item:", error);
    } finally {
      setProcessing(prev => ({ ...prev, [item.id]: false }));
    }
  };

  const formatSchedule = (item: AutoReplenishItem) => {
    if (item.custom_days && item.custom_days.length > 0) {
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const days = item.custom_days.map(d => dayNames[parseInt(d)]).join(', ');
      return `${days} at ${item.custom_time || '09:00'}`;
    }
    return `Every ${item.frequencyDays} days at ${item.custom_time || '09:00'}`;
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
        <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <RefreshCw className="mr-2 h-5 w-5" />
            Auto-Replenish Subscriptions
          </h2>
          <p className="text-muted-foreground mt-1">
            Manage your recurring product orders
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={() => navigate("/shop")} variant="outline" className="gap-2">
            <PlusCircle size={16} />
            Add Products
          </Button>
          <Button onClick={() => navigate("/auto-replenish")} variant="default" className="gap-2">
            <ExternalLink size={16} />
            Manage All
          </Button>
        </div>
      </div>

      {autoReplenishItems.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Active Subscriptions</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Schedule</TableHead>
                    <TableHead>Next Order</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {autoReplenishItems.slice(0, 5).map((item) => {
                    const product = products[item.productId];
                    
                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded bg-muted/30 mr-3 overflow-hidden">
                              {product?.image && (
                                <img 
                                  src={product.image} 
                                  alt={product?.name || "Product"}
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{product?.name || "Product"}</p>
                              <p className="text-xs text-muted-foreground">{product?.category}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>
                          <span className="text-sm">{formatSchedule(item)}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                            {format(new Date(item.nextOrderDate), "MMM d, yyyy")}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={item.active ? "bg-green-500" : "bg-gray-500"}>
                            {item.active ? "Active" : "Paused"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Switch
                              checked={item.active}
                              onCheckedChange={() => handleToggleStatus(item)}
                              disabled={!!processing[item.id]}
                              title={item.active ? "Pause" : "Activate"}
                            />
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  className="text-red-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20"
                                  disabled={!!processing[item.id]}
                                >
                                  <Trash2 size={16} />
                                  <span className="sr-only">Remove</span>
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Remove from Auto-Replenish?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will remove the product from your auto-replenish schedule. 
                                    You can always add it again later.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleRemoveItem(item)}
                                    className="bg-red-500 hover:bg-red-600"
                                  >
                                    Remove
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            
            {autoReplenishItems.length > 5 && (
              <div className="p-4 border-t">
                <Button 
                  onClick={() => navigate("/auto-replenish")} 
                  variant="outline" 
                  className="w-full"
                >
                  View All {autoReplenishItems.length} Items
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <RefreshCw className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Auto-Replenish Items</h3>
            <p className="text-muted-foreground mb-4">
              Set up automatic reordering for your favorite products
            </p>
            <Button onClick={() => navigate("/shop")} className="gap-2">
              <PlusCircle size={16} />
              Browse Products
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AutoReplenishTab;