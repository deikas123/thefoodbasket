
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Package, Clock } from "lucide-react";

const OrderSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card className="text-center">
          <CardHeader className="pb-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-600">Order Confirmed!</CardTitle>
            <CardDescription className="text-lg">
              Thank you for your purchase. Your order has been successfully placed.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {orderId && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Order Number</p>
                <p className="font-semibold text-lg">#{orderId}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
                <div className="text-left">
                  <p className="font-medium">Processing</p>
                  <p className="text-sm text-gray-600">We're preparing your order</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600" />
                <div className="text-left">
                  <p className="font-medium">Estimated Delivery</p>
                  <p className="text-sm text-gray-600">2-3 business days</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-gray-600">
                You will receive an email confirmation shortly with your order details and tracking information.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={() => navigate("/orders")} className="flex-1 sm:flex-none">
                  View Orders
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate("/shop")}
                  className="flex-1 sm:flex-none"
                >
                  Continue Shopping
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrderSuccess;
