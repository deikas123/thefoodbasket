
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";
import { getUserWallet, createWalletIfNotExist } from "@/services/walletService";
import { Wallet as WalletType } from "@/types/wallet";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addFundsToWallet } from "@/services/walletService";

const WalletCard = () => {
  const [wallet, setWallet] = useState<WalletType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [amount, setAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  useEffect(() => {
    const fetchWallet = async () => {
      setIsLoading(true);
      try {
        // Create wallet if it doesn't exist
        const walletData = await createWalletIfNotExist();
        setWallet(walletData);
      } catch (error) {
        console.error("Error fetching wallet:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchWallet();
  }, []);
  
  const handleAddFunds = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    
    setIsProcessing(true);
    try {
      const success = await addFundsToWallet(parseFloat(amount));
      if (success) {
        // Refresh wallet data
        const walletData = await getUserWallet();
        setWallet(walletData);
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
    <Card>
      <CardHeader className="bg-primary/5 pb-4">
        <CardTitle className="flex items-center">
          <Wallet className="mr-2" />
          My Wallet
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {isLoading ? (
          <div className="animate-pulse flex flex-col space-y-2">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Current Balance</p>
              <p className="text-3xl font-bold">${wallet?.balance.toFixed(2) || "0.00"}</p>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full">Add Funds</Button>
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
            
            <Button variant="outline" className="w-full" onClick={() => window.location.href = "/wallet"}>
              View Transactions
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WalletCard;
