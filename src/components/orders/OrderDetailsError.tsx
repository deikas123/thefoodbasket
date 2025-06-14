
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface OrderDetailsErrorProps {
  error?: string;
  isNotFound?: boolean;
}

const OrderDetailsError = ({ error, isNotFound }: OrderDetailsErrorProps) => {
  const navigate = useNavigate();

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
            <h3 className="font-medium text-xl mb-2">
              {isNotFound ? "Order not found" : "Error loading order"}
            </h3>
            <p className="text-muted-foreground mb-6">
              {isNotFound 
                ? "The order you're looking for doesn't exist or you don't have permission to view it."
                : error || "We couldn't load your order details."
              }
            </p>
            <Button onClick={isNotFound ? () => navigate("/orders") : () => window.location.reload()}>
              {isNotFound ? "View My Orders" : "Try Again"}
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrderDetailsError;
