import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { getOrderById, cancelOrder } from "@/services/orderService";
import { Order } from "@/types";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { convertToOrder } from "@/utils/typeConverters";
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
import {
  ArrowLeft,
  Calendar,
  Clock,
  CreditCard,
  Home,
  MapPin,
  Phone,
  Package,
  RefreshCcw,
  ShoppingBag,
  Truck,
  User,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";

const OrderDetails = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  console.log("OrderDetails component mounted", { orderId, user, isAuthenticated, authLoading });

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        console.log("No orderId provided in URL params");
        setError("No order ID provided");
        setIsLoading(false);
        return;
      }

      if (!user || !isAuthenticated) {
        console.log("User not authenticated, waiting...");
        return;
      }
      
      try {
        console.log("Fetching order with ID:", orderId);
        setIsLoading(true);
        setError(null);
        
        const orderData = await getOrderById(orderId);
        console.log("Fetched order data:", orderData);
        
        if (orderData) {
          const convertedOrder = convertToOrder(orderData);
          console.log("Converted order:", convertedOrder);
          setOrder(convertedOrder);
        } else {
          console.log("No order data found for ID:", orderId);
          setError("Order not found");
          setOrder(null);
        }
      } catch (error) {
        console.error("Failed to fetch order:", error);
        setError("Failed to fetch order details");
        toast({
          title: "Error fetching order",
          description: "We couldn't load your order details.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading) {
      fetchOrder();
    }
  }, [orderId, user, isAuthenticated, authLoading]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      console.log("User not authenticated, redirecting to login");
      navigate("/login", { state: { from: `/orders/${orderId}` } });
    }
  }, [authLoading, isAuthenticated, navigate, orderId]);

  // Handle order cancellation
  const handleCancelOrder = async () => {
    if (!order) return;
    
    setIsCancelling(true);
    try {
      const updatedOrderType = await cancelOrder(order.id);
      if (updatedOrderType) {
        const updatedOrder = convertToOrder(updatedOrderType);
        setOrder(updatedOrder);
        toast({
          title: "Order cancelled",
          description: "Your order has been successfully cancelled.",
        });
      }
    } catch (error) {
      console.error("Failed to cancel order:", error);
      toast({
        title: "Error cancelling order",
        description: "We couldn't cancel your order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCancelling(false);
    }
  };

  // Helper function to get status badge color
  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pending": return "bg-yellow-500 hover:bg-yellow-600";
      case "processing": return "bg-blue-500 hover:bg-blue-600";
      case "dispatched": return "bg-purple-500 hover:bg-purple-600";
      case "out_for_delivery": return "bg-indigo-500 hover:bg-indigo-600";
      case "delivered": return "bg-green-500 hover:bg-green-600";
      case "cancelled": return "bg-red-500 hover:bg-red-600";
      default: return "bg-gray-500 hover:bg-gray-600";
    }
  };

  // Show loading state
  if (authLoading || isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow pt-24 pb-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-1/3"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <Card className="mt-8">
                <CardHeader className="bg-muted/50 h-20"></CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="h-4 bg-muted rounded w-full"></div>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-20 bg-muted rounded w-full"></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow pt-24 pb-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/orders")} 
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Orders
            </Button>
            
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                <ShoppingBag size={30} className="text-muted-foreground" />
              </div>
              <h3 className="font-medium text-xl mb-2">Error loading order</h3>
              <p className="text-muted-foreground mb-6">
                {error}
              </p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Show order not found state
  if (!order) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow pt-24 pb-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/orders")} 
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Orders
            </Button>
            
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                <ShoppingBag size={30} className="text-muted-foreground" />
              </div>
              <h3 className="font-medium text-xl mb-2">Order not found</h3>
              <p className="text-muted-foreground mb-6">
                The order you're looking for doesn't exist or you don't have permission to view it.
              </p>
              <Button onClick={() => navigate("/orders")}>
                View My Orders
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/orders")} 
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Button>
          
          {/* Show loading state */}
          {(authLoading || isLoading) && (
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-1/3"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <Card className="mt-8">
                <CardHeader className="bg-muted/50 h-20"></CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="h-4 bg-muted rounded w-full"></div>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-20 bg-muted rounded w-full"></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Show error state */}
          {error && !isLoading && (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                <ShoppingBag size={30} className="text-muted-foreground" />
              </div>
              <h3 className="font-medium text-xl mb-2">Error loading order</h3>
              <p className="text-muted-foreground mb-6">
                {error}
              </p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          )}

          {/* Show order not found state */}
          {!order && !isLoading && !error && (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                <ShoppingBag size={30} className="text-muted-foreground" />
              </div>
              <h3 className="font-medium text-xl mb-2">Order not found</h3>
              <p className="text-muted-foreground mb-6">
                The order you're looking for doesn't exist or you don't have permission to view it.
              </p>
              <Button onClick={() => navigate("/orders")}>
                View My Orders
              </Button>
            </div>
          )}

          {/* Show order details when available */}
          {order && !isLoading && !error && (
            <>
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-3xl font-bold flex items-center">
                    Order #{order.id}
                    <Badge 
                      className={`ml-2 capitalize ${getStatusColor(order.status)}`}
                    >
                      {order.status.replace("_", " ")}
                    </Badge>
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Placed on {format(new Date(order.createdAt), "PPP 'at' p")}
                  </p>
                </div>
                
                {/* Show cancel button only for orders that aren't delivered or cancelled */}
                {order.status !== "delivered" && order.status !== "cancelled" && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="text-destructive border-destructive">
                        <XCircle className="mr-2 h-4 w-4" />
                        Cancel Order
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Cancel your order?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to cancel this order? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>No, keep my order</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleCancelOrder}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          disabled={isCancelling}
                        >
                          {isCancelling ? (
                            <>
                              <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
                              Cancelling...
                            </>
                          ) : (
                            "Yes, cancel order"
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
              
              {/* Order tracking */}
              <Card className="mb-8">
                <CardHeader className="bg-muted/10 py-4">
                  <CardTitle className="text-xl">Order Tracking</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex items-center mb-6">
                    <Clock className="h-5 w-5 text-muted-foreground mr-2" />
                    <span className="text-sm">
                      Estimated Delivery: <span className="font-medium">{order.estimatedDelivery}</span>
                    </span>
                  </div>
                  
                  {/* Tracking timeline */}
                  <div className="relative">
                    {order.tracking?.events?.map((event, index) => {
                      const isLast = index === order.tracking!.events.length - 1;
                      
                      return (
                        <div key={index} className="flex mb-6 last:mb-0">
                          {/* Status line */}
                          {!isLast && (
                            <div className="absolute top-5 left-4 w-0.5 h-full bg-muted -z-10"></div>
                          )}
                          
                          {/* Status circle */}
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 flex-shrink-0 ${
                            getStatusColor(event.status)
                          }`}>
                            <Package className="h-4 w-4 text-white" />
                          </div>
                          
                          {/* Status details */}
                          <div>
                            <p className="font-medium">{event.description}</p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(event.timestamp), "PPP 'at' p")}
                            </p>
                            {event.location && (
                              <p className="text-sm mt-1 flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                {event.location}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    }) || (
                      <p className="text-muted-foreground">No tracking information available yet.</p>
                    )}
                  </div>
                  
                  {/* Driver information for out-for-delivery orders */}
                  {(order.status === "out_for_delivery" && order.tracking?.driver) && (
                    <div className="mt-6 p-4 border rounded-md bg-muted/10">
                      <h3 className="font-medium mb-3">Delivery Driver</h3>
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                          <img 
                            src={order.tracking.driver.photo} 
                            alt={order.tracking.driver.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-medium">{order.tracking.driver.name}</p>
                          <p className="text-sm flex items-center">
                            <Phone className="h-3 w-3 mr-1" />
                            {order.tracking.driver.phone}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Order details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Order items */}
                <div className="md:col-span-2">
                  <Card>
                    <CardHeader className="bg-muted/10 py-4">
                      <CardTitle className="text-xl">Order Items</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="divide-y">
                        {order.items.map((item) => (
                          <div key={item.productId} className="flex p-4">
                            <div className="h-16 w-16 rounded bg-muted/30 overflow-hidden mr-4">
                              <img 
                                src={item.image} 
                                alt={item.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="flex-grow">
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-muted-foreground">
                                Quantity: {item.quantity}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                              <p className="text-sm text-muted-foreground">
                                ${item.price.toFixed(2)} each
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="mt-6">
                    <CardHeader className="bg-muted/10 py-4">
                      <CardTitle className="text-xl">Delivery Information</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="font-medium flex items-center mb-2">
                            <Home className="h-4 w-4 mr-2" />
                            Delivery Address
                          </h3>
                          <p className="text-sm">
                            {order.deliveryAddress.street} <br />
                            {order.deliveryAddress.city}, {order.deliveryAddress.state} <br />
                            {order.deliveryAddress.zipCode}
                          </p>
                        </div>
                        
                        <div>
                          <h3 className="font-medium flex items-center mb-2">
                            <Truck className="h-4 w-4 mr-2" />
                            Delivery Method
                          </h3>
                          <p className="text-sm">
                            {order.deliveryMethod.name} <br />
                            ${order.deliveryMethod.price.toFixed(2)} <br />
                            {order.deliveryMethod.estimatedDelivery}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Order summary */}
                <div>
                  <Card className="sticky top-24">
                    <CardHeader className="bg-muted/10 py-4">
                      <CardTitle className="text-xl">Order Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Subtotal</span>
                          <span>${order.subtotal.toFixed(2)}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Delivery</span>
                          <span>${order.deliveryFee.toFixed(2)}</span>
                        </div>
                        
                        <Separator />
                        
                        <div className="flex justify-between font-medium">
                          <span>Total</span>
                          <span>${order.total.toFixed(2)}</span>
                        </div>
                        
                        <div className="flex items-center pt-2">
                          <CreditCard className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="text-sm">
                            Paid with {order.paymentMethod.name}
                          </span>
                        </div>
                        
                        {order.status === "delivered" && (
                          <Button className="w-full mt-2">
                            <RefreshCcw className="mr-2 h-4 w-4" />
                            Buy Again
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrderDetails;
