
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import OrderDetailsHeader from "@/components/orders/OrderDetailsHeader";
import OrderTracking from "@/components/orders/OrderTracking";
import OrderItemsList from "@/components/orders/OrderItemsList";
import DeliveryInfo from "@/components/orders/DeliveryInfo";
import OrderSummaryCard from "@/components/orders/OrderSummaryCard";
import OrderDetailsError from "@/components/orders/OrderDetailsError";
import OrderDetailsLoading from "@/components/orders/OrderDetailsLoading";
import ReceiptCard from "@/components/orders/ReceiptCard";
import { useOrderDetails } from "@/hooks/useOrderDetails";

const OrderDetails = () => {
  const { order, isLoading, error, isCancelling, handleCancelOrder } = useOrderDetails();

  // Show loading state
  if (isLoading) {
    return <OrderDetailsLoading />;
  }

  // Show error state
  if (error) {
    return <OrderDetailsError error={error} />;
  }

  // Show order not found state
  if (!order) {
    return <OrderDetailsError isNotFound={true} />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <OrderDetailsHeader 
            order={order}
            onCancelOrder={handleCancelOrder}
            isCancelling={isCancelling}
          />
          
          <OrderTracking order={order} />
          
          {/* Order details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Order items */}
            <div className="md:col-span-2 space-y-6">
              <OrderItemsList order={order} />
              <DeliveryInfo order={order} />
            </div>
            
            {/* Order summary and receipt */}
            <div className="space-y-6">
              <OrderSummaryCard order={order} />
              <ReceiptCard orderId={order.id} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrderDetails;
