
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { getUserWallet, getWalletTransactions } from "@/services/walletService";
import { Wallet, WalletTransaction } from "@/types/wallet";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  ArrowLeft, 
  ArrowDown, 
  ArrowUp, 
  RefreshCw,
  PlusCircle,
  ArrowRightLeft,
  Wallet as WalletIcon
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addFundsToWallet } from "@/services/walletService";
import { format } from "date-fns";

const WalletPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [amount, setAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated) {
      navigate("/login", { state: { from: "/wallet" } });
      return;
    }
    
    const fetchWalletData = async () => {
      setIsLoading(true);
      try {
        // Get wallet data
        const walletData = await getUserWallet();
        setWallet(walletData);
        
        // Get transactions
        const transactionsData = await getWalletTransactions();
        setTransactions(transactionsData);
      } catch (error) {
        console.error("Error fetching wallet data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchWalletData();
  }, [isAuthenticated, navigate]);
  
  const handleAddFunds = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    
    setIsProcessing(true);
    try {
      const success = await addFundsToWallet(parseFloat(amount));
      if (success) {
        // Refresh wallet data
        const walletData = await getUserWallet();
        setWallet(walletData);
        
        // Refresh transactions
        const transactionsData = await getWalletTransactions();
        setTransactions(transactionsData);
        
        setAmount("");
        setIsDialogOpen(false);
      }
    } catch (error) {
      console.error("Error adding funds:", error);
    } finally {
      setIsProcessing(false);
    }
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
          
          <div className="flex flex-col md:flex-row items-start justify-between gap-6 mb-8">
            <div>
              <h1 className="text-3xl font-bold">My Wallet</h1>
              <p className="text-muted-foreground mt-1">
                Manage your wallet balance and transactions
              </p>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <PlusCircle size={16} />
                  Add Funds
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Funds to Wallet</DialogTitle>
                  <DialogDescription>
                    Enter the amount you want to add to your wallet.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-3">$</span>
                      <Input
                        id="amount"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        className="pl-7"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full" 
                    onClick={handleAddFunds} 
                    disabled={isProcessing || !amount || parseFloat(amount) <= 0}
                  >
                    {isProcessing ? "Processing..." : "Add Funds"}
                  </Button>
                  
                  <p className="text-sm text-muted-foreground text-center">
                    *In a real app, this would connect to a payment gateway.
                  </p>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          <Card className="mb-8">
            <CardHeader className="bg-primary/5">
              <CardTitle className="flex items-center">
                <WalletIcon className="mr-2 h-5 w-5" />
                Wallet Balance
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {isLoading ? (
                <div className="animate-pulse h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
              ) : (
                <div className="flex items-center">
                  <span className="text-3xl font-bold">
                    ${wallet?.balance.toFixed(2) || "0.00"}
                  </span>
                  <Button variant="outline" size="sm" className="ml-4 gap-1">
                    <RefreshCw size={14} />
                    <span className="hidden sm:inline">Refresh</span>
                  </Button>
                </div>
              )}
              
              <p className="text-sm text-muted-foreground mt-2">
                Your wallet balance can be used for faster checkout and to manage pay-later orders.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="bg-primary/5">
              <CardTitle className="flex items-center">
                <ArrowRightLeft className="mr-2 h-5 w-5" />
                Transaction History
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {isLoading ? (
                <div className="animate-pulse space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  ))}
                </div>
              ) : transactions.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => {
                      const isDeposit = transaction.transactionType === "deposit";
                      const isRefund = transaction.transactionType === "refund";
                      const isCredit = isDeposit || isRefund;
                      
                      return (
                        <TableRow key={transaction.id}>
                          <TableCell className="text-muted-foreground">
                            {format(new Date(transaction.createdAt), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              {isCredit ? (
                                <ArrowDown size={16} className="mr-1 text-green-500" />
                              ) : (
                                <ArrowUp size={16} className="mr-1 text-red-500" />
                              )}
                              {transaction.transactionType.charAt(0).toUpperCase() + 
                                transaction.transactionType.slice(1)}
                            </div>
                          </TableCell>
                          <TableCell>{transaction.description || "-"}</TableCell>
                          <TableCell className={`text-right ${isCredit ? "text-green-500" : "text-red-500"}`}>
                            {isCredit ? "+" : "-"}${Math.abs(transaction.amount).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">No transactions yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default WalletPage;
