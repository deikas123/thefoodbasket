
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, XCircle, RefreshCcw } from "lucide-react";
import { format } from "date-fns";
import { Order } from "@/types";
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

interface OrderDetailsHeaderProps {
  order: Order;
  onCancelOrder: () => Promise<void>;
  isCancelling: boolean;
}

const OrderDetailsHeader = ({ order, onCancelOrder, isCancelling }: OrderDetailsHeaderProps) => {
  const navigate = useNavigate();

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
    <>
      <Button 
        variant="ghost" 
        onClick={() => navigate("/orders")} 
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Orders
      </Button>
      
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
                  onClick={onCancelOrder}
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
    </>
  );
};

export default OrderDetailsHeader;
