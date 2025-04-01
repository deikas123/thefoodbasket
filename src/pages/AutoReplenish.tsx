
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { getUserAutoReplenishItems, toggleAutoReplenishStatus, removeFromAutoReplenish } from "@/services/autoReplenishService";
import { getProductById } from "@/services/productService";
import { AutoReplenishItem } from "@/types/autoReplenish";
import { Product } from "@/types";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  ArrowLeft, 
  Calendar, 
  RefreshCw,
  Trash2,
  CalendarClock,
  Clock,
  ShoppingCart,
  PlusCircle,
  AlertCircle
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

const AutoReplenishPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [autoReplenishItems, setAutoReplenishItems] = useState<AutoReplenishItem[]>([]);
  const [products, setProducts] = useState<{[key: string]: Product}>({});
  const [isLoading, setIsLoading] = useState(true);
  const [processing, setProcessing] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated) {
      navigate("/login", { state: { from: "/auto-replenish" } });
      return;
    }
    
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
  }, [isAuthenticated, navigate]);
  
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
  
  // Group items by status (upcoming and processing)
  const upcomingItems = autoReplenishItems.filter(item => 
    item.active && isAfter(new Date(item.nextOrderDate), new Date())
  );
  
  const inactiveItems = autoReplenishItems.filter(item => !item.active);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/profile")} 
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Profile
          </Button>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold flex items-center">
                <RefreshCw className="mr-2 h-6 w-6" />
                Auto-Replenish
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage your recurring product orders
              </p>
            </div>
            
            <Button onClick={() => navigate("/shop")} className="gap-2">
              <PlusCircle size={16} />
              Add Products
            </Button>
          </div>
          
          {isLoading ? (
            <div className="animate-pulse space-y-6">
              <div className="h-60 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          ) : autoReplenishItems.length > 0 ? (
            <div className="space-y-8">
              {/* Upcoming Orders */}
              <Card>
                <CardHeader className="bg-primary/5">
                  <CardTitle className="flex items-center">
                    <Calendar className="mr-2 h-5 w-5" />
                    Upcoming Auto-Replenish Orders
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {upcomingItems.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Frequency</TableHead>
                          <TableHead>Next Order</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {upcomingItems.map((item) => {
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
                              <TableCell>Every {item.frequencyDays} days</TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                                  {format(new Date(item.nextOrderDate), "MMM d, yyyy")}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge className="bg-green-500">Active</Badge>
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
                  ) : (
                    <div className="py-8 text-center">
                      <p className="text-muted-foreground">No active auto-replenish items</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Inactive Items */}
              {inactiveItems.length > 0 && (
                <Card>
                  <CardHeader className="bg-muted/30">
                    <CardTitle className="flex items-center">
                      <CalendarClock className="mr-2 h-5 w-5" />
                      Paused Auto-Replenish Items
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Frequency</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {inactiveItems.map((item) => {
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
                              <TableCell>Every {item.frequencyDays} days</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="border-gray-400 text-gray-500">
                                  Paused
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
                  </CardContent>
                </Card>
              )}
              
              {/* How It Works */}
              <div className="bg-muted/30 p-6 rounded-lg">
                <h3 className="font-medium text-lg mb-4">How Auto-Replenish Works</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                      <ShoppingCart className="h-4 w-4 text-blue-600" />
                    </div>
                    <h4 className="font-medium">Select Products</h4>
                    <p className="text-sm text-muted-foreground">
                      Choose products you want to receive regularly and set the quantity.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-blue-600" />
                    </div>
                    <h4 className="font-medium">Set Schedule</h4>
                    <p className="text-sm text-muted-foreground">
                      Choose how often you want the products to be delivered.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                      <RefreshCw className="h-4 w-4 text-blue-600" />
                    </div>
                    <h4 className="font-medium">Automatic Orders</h4>
                    <p className="text-sm text-muted-foreground">
                      We'll automatically place your orders according to your schedule.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 pb-6 flex flex-col items-center justify-center text-center">
                <RefreshCw className="h-12 w-12 text-muted-foreground mb-3" />
                <h3 className="text-xl font-medium mb-2">No Auto-Replenish Items</h3>
                <p className="text-muted-foreground max-w-md mb-6">
                  You haven't set up any auto-replenish items yet. Add products to your auto-replenish schedule to have them automatically ordered on a regular basis.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button onClick={() => navigate("/shop")}>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Browse Products
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AutoReplenishPage;
