
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { getUserOrders } from "@/services/orderService";
import { Order } from "@/types";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Clock, Package, ShoppingBag, Truck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const Orders = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (user && isAuthenticated) {
        try {
          const userOrders = await getUserOrders(user.id);
          setOrders(userOrders);
        } catch (error) {
          console.error("Failed to fetch orders:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    if (!authLoading) {
      fetchOrders();
    }
  }, [user, isAuthenticated, authLoading]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login", { state: { from: "/orders" } });
    }
  }, [authLoading, isAuthenticated, navigate]);

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

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">My Orders</h1>
            <p className="text-muted-foreground mt-2">
              View and track your orders
            </p>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="w-full animate-pulse">
                  <CardHeader className="bg-muted/50 h-20"></CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="h-4 bg-muted rounded w-1/4"></div>
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                <ShoppingBag size={30} className="text-muted-foreground" />
              </div>
              <h3 className="font-medium text-xl mb-2">No orders yet</h3>
              <p className="text-muted-foreground mb-6">
                You haven't placed any orders yet. Start shopping to place your first order.
              </p>
              <Button onClick={() => navigate("/shop")}>
                Browse Products
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <Card key={order.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="bg-muted/10 py-4">
                    <div className="flex flex-wrap justify-between items-center">
                      <div>
                        <CardTitle className="text-lg md:text-xl flex items-center">
                          Order #{order.id}
                          <Badge 
                            className={`ml-2 capitalize ${getStatusColor(order.status)}`}
                          >
                            {order.status.replace("_", " ")}
                          </Badge>
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          Placed {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      <Button 
                        variant="outline"
                        onClick={() => navigate(`/orders/${order.id}`)}
                      >
                        View Details
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between">
                        <div className="flex items-center mb-2 md:mb-0">
                          <Clock className="h-5 w-5 text-muted-foreground mr-2" />
                          <span className="text-sm">Estimated Delivery: <span className="font-medium">{order.estimatedDelivery}</span></span>
                        </div>
                        <div className="flex items-center">
                          <Package className="h-5 w-5 text-muted-foreground mr-2" />
                          <span className="text-sm">Items: <span className="font-medium">{order.items.reduce((sum, item) => sum + item.quantity, 0)}</span></span>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="flex flex-wrap items-center gap-4">
                        {order.items.slice(0, 3).map((item) => (
                          <div key={item.productId} className="flex items-center">
                            <div className="h-14 w-14 rounded bg-muted/30 overflow-hidden mr-3">
                              <img 
                                src={item.image} 
                                alt={item.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{item.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {item.quantity} × ${item.price.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        ))}
                        
                        {order.items.length > 3 && (
                          <div className="text-sm text-muted-foreground">
                            +{order.items.length - 3} more items
                          </div>
                        )}
                      </div>
                      
                      <Separator />
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <Truck className="h-5 w-5 text-muted-foreground mr-2" />
                          <span className="text-sm">{order.deliveryMethod.name}</span>
                        </div>
                        <div className="font-semibold">
                          Total: ${order.total.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Orders;
