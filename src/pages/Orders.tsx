
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import OrdersHeader from "@/components/orders/OrdersHeader";
import EmptyOrdersState from "@/components/orders/EmptyOrdersState";
import ErrorState from "@/components/orders/ErrorState";
import LoadingState from "@/components/orders/LoadingState";
import OrdersList from "@/components/orders/OrdersList";
import { useOrders } from "@/hooks/useOrders";

const Orders = () => {
  const navigate = useNavigate();
  const { orders, isLoading, error, user, isAuthenticated, authLoading } = useOrders();

  console.log("Orders component mounted", { user, isAuthenticated, authLoading });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      console.log("User not authenticated, redirecting to login");
      navigate("/login", { state: { from: "/orders" } });
    }
  }, [authLoading, isAuthenticated, navigate]);

  const handleViewOrder = (orderId: string) => {
    console.log("Navigating to order details with ID:", orderId);
    navigate(`/orders/${orderId}`);
  };

  const handleBrowseProducts = () => {
    navigate("/shop");
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <OrdersHeader 
            ordersCount={orders.length}
            onBrowseProducts={handleBrowseProducts}
          />

          {isLoading && <LoadingState />}

          {error && !isLoading && <ErrorState error={error} />}

          {!isLoading && !error && orders.length === 0 && (
            <EmptyOrdersState onBrowseProducts={handleBrowseProducts} />
          )}

          {!isLoading && !error && orders.length > 0 && (
            <OrdersList orders={orders} onViewOrder={handleViewOrder} />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Orders;
