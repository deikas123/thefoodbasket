
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { getUserPayLaterOrders, makePayLaterPayment } from "@/services/payLaterService";
import { getUserKYCStatus } from "@/services/kycService";
import { PayLaterOrder } from "@/types/payLater";
import { KYCVerification } from "@/types/kyc";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import KYCVerificationForm from "@/components/payLater/KYCVerificationForm";
import { 
  ArrowLeft, 
  CalendarClock, 
  Clock, 
  CreditCard,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addDays, format, formatDistance, isPast } from "date-fns";

const PayLaterPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [payLaterOrders, setPayLaterOrders] = useState<PayLaterOrder[]>([]);
  const [kycStatus, setKycStatus] = useState<KYCVerification | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("orders");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated) {
      navigate("/login", { state: { from: "/pay-later" } });
      return;
    }
    
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Get KYC status
        const kycData = await getUserKYCStatus();
        setKycStatus(kycData);
        
        // Get pay later orders if KYC is approved
        if (kycData?.status === "approved") {
          const ordersData = await getUserPayLaterOrders();
          setPayLaterOrders(ordersData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [isAuthenticated, navigate]);
  
  const handlePayment = async () => {
    if (!selectedOrderId || !paymentAmount || parseFloat(paymentAmount) <= 0) return;
    
    setIsProcessing(true);
    try {
      const success = await makePayLaterPayment(
        selectedOrderId, 
        parseFloat(paymentAmount)
      );
      
      if (success) {
        // Refresh orders
        const ordersData = await getUserPayLaterOrders();
        setPayLaterOrders(ordersData);
        setPaymentAmount("");
        setSelectedOrderId(null);
      }
    } catch (error) {
      console.error("Error making payment:", error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleVerificationSubmitted = async () => {
    // Refresh KYC status
    const kycData = await getUserKYCStatus();
    setKycStatus(kycData);
  };

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
          
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Buy Now, Pay Later</h1>
            <p className="text-muted-foreground mt-1">
              Manage your pay later orders and verify your identity
            </p>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 mb-8">
              <TabsTrigger value="orders">My Pay Later Orders</TabsTrigger>
              <TabsTrigger value="verification">Identity Verification</TabsTrigger>
            </TabsList>
            
            <TabsContent value="orders">
              {isLoading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              ) : kycStatus?.status !== "approved" ? (
                <Card>
                  <CardHeader className="bg-muted/30">
                    <CardTitle className="flex items-center">
                      <AlertCircle className="mr-2 h-5 w-5 text-amber-500" />
                      Verification Required
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <p className="mb-6">
                      You need to complete identity verification before you can use Buy Now, Pay Later.
                    </p>
                    <Button onClick={() => setActiveTab("verification")}>
                      Go to Verification
                    </Button>
                  </CardContent>
                </Card>
              ) : payLaterOrders.length > 0 ? (
                <div className="space-y-6">
                  {payLaterOrders.map((order) => {
                    const paymentPercentage = (order.paidAmount / order.totalAmount) * 100;
                    const isPastDue = isPast(new Date(order.dueDate)) && order.status !== "completed";
                    const remainingAmount = order.totalAmount - order.paidAmount;
                    
                    return (
                      <Card key={order.id} className={isPastDue ? "border-red-300" : ""}>
                        <CardHeader className={`${isPastDue ? "bg-red-50 dark:bg-red-900/10" : "bg-muted/30"}`}>
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-base sm:text-lg">
                              Order #{order.orderId.substring(0, 8)}
                            </CardTitle>
                            
                            {order.status === "completed" ? (
                              <Badge className="bg-green-500">Paid</Badge>
                            ) : isPastDue ? (
                              <Badge className="bg-red-500">Overdue</Badge>
                            ) : (
                              <Badge className="bg-blue-500">Active</Badge>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                          <div className="space-y-4">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Total Amount</span>
                              <span className="font-medium">${order.totalAmount.toFixed(2)}</span>
                            </div>
                            
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Paid So Far</span>
                              <span className="font-medium">${order.paidAmount.toFixed(2)}</span>
                            </div>
                            
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Remaining</span>
                              <span className="font-medium">${remainingAmount.toFixed(2)}</span>
                            </div>
                            
                            <div className="flex justify-between text-sm items-center">
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                                <span className={`text-muted-foreground ${isPastDue ? "text-red-500" : ""}`}>
                                  {isPastDue 
                                    ? `Overdue by ${formatDistance(new Date(order.dueDate), new Date())}` 
                                    : `Due in ${formatDistance(new Date(), new Date(order.dueDate))}`
                                  }
                                </span>
                              </div>
                              <span className={`font-medium ${isPastDue ? "text-red-500" : ""}`}>
                                {format(new Date(order.dueDate), 'MMM d, yyyy')}
                              </span>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Payment Progress</span>
                                <span>{paymentPercentage.toFixed(0)}%</span>
                              </div>
                              <Progress value={paymentPercentage} className="h-2" />
                            </div>
                            
                            {order.status !== "completed" && (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    className="w-full" 
                                    onClick={() => {
                                      setSelectedOrderId(order.id);
                                      setPaymentAmount(remainingAmount.toFixed(2));
                                    }}
                                  >
                                    <CreditCard className="mr-2 h-4 w-4" />
                                    Make a Payment
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Make a Payment</DialogTitle>
                                    <DialogDescription>
                                      Enter the amount you want to pay towards your order.
                                    </DialogDescription>
                                  </DialogHeader>
                                  
                                  <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="payment-amount">Payment Amount</Label>
                                      <div className="relative">
                                        <span className="absolute left-3 top-3">$</span>
                                        <Input
                                          id="payment-amount"
                                          type="number"
                                          min="0.01"
                                          max={remainingAmount}
                                          step="0.01"
                                          className="pl-7"
                                          value={paymentAmount}
                                          onChange={(e) => setPaymentAmount(e.target.value)}
                                        />
                                      </div>
                                      <p className="text-xs text-muted-foreground">
                                        Remaining balance: ${remainingAmount.toFixed(2)}
                                      </p>
                                    </div>
                                    
                                    <div className="flex space-x-2">
                                      <DialogClose asChild>
                                        <Button variant="outline" className="flex-1">Cancel</Button>
                                      </DialogClose>
                                      <Button 
                                        className="flex-1" 
                                        onClick={handlePayment} 
                                        disabled={
                                          isProcessing || 
                                          !paymentAmount || 
                                          parseFloat(paymentAmount) <= 0 ||
                                          parseFloat(paymentAmount) > remainingAmount
                                        }
                                      >
                                        {isProcessing ? "Processing..." : "Pay Now"}
                                      </Button>
                                    </div>
                                    
                                    <p className="text-sm text-muted-foreground text-center">
                                      *In a real app, this would connect to a payment gateway.
                                    </p>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <Card>
                  <CardContent className="pt-6 pb-6 flex flex-col items-center justify-center text-center">
                    <CalendarClock className="h-12 w-12 text-muted-foreground mb-3" />
                    <h3 className="text-xl font-medium mb-2">No Pay Later Orders</h3>
                    <p className="text-muted-foreground max-w-md">
                      You haven't created any pay later orders yet. Select "Pay Later" at checkout to buy now and pay within 30 days.
                    </p>
                    <Button 
                      className="mt-6" 
                      onClick={() => navigate("/shop")}
                    >
                      Continue Shopping
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="verification">
              {isLoading ? (
                <div className="animate-pulse h-60 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ) : (
                <KYCVerificationForm 
                  kycData={kycStatus} 
                  onVerificationSubmit={handleVerificationSubmitted} 
                />
              )}
              
              <div className="mt-8 space-y-4 bg-muted/30 rounded-lg p-6">
                <h3 className="text-lg font-medium mb-3 flex items-center">
                  <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                  How Buy Now, Pay Later Works
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-3">
                      <span className="font-bold text-blue-600 dark:text-blue-400">1</span>
                    </div>
                    <h4 className="font-medium mb-1">Verify Your Identity</h4>
                    <p className="text-sm text-muted-foreground">
                      Complete our simple identity verification process to become eligible.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-3">
                      <span className="font-bold text-blue-600 dark:text-blue-400">2</span>
                    </div>
                    <h4 className="font-medium mb-1">Shop & Select Pay Later</h4>
                    <p className="text-sm text-muted-foreground">
                      During checkout, select the "Buy Now, Pay Later" payment option.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-3">
                      <span className="font-bold text-blue-600 dark:text-blue-400">3</span>
                    </div>
                    <h4 className="font-medium mb-1">Pay Within 30 Days</h4>
                    <p className="text-sm text-muted-foreground">
                      Pay the full amount within 30 days with no fees or interest.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PayLaterPage;
