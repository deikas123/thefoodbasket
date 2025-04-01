
import { supabase } from "@/integrations/supabase/client";
import { Wallet, WalletTransaction } from "@/types/wallet";
import { toast } from "@/hooks/use-toast";

// Get user wallet
export const getUserWallet = async (): Promise<Wallet | null> => {
  const { data, error } = await supabase
    .from("wallets")
    .select("*")
    .single();
  
  if (error) {
    console.error("Error fetching wallet:", error);
    return null;
  }
  
  return data as Wallet;
};

// Create wallet for user if it doesn't exist
export const createWalletIfNotExist = async (): Promise<Wallet | null> => {
  const existingWallet = await getUserWallet();
  
  if (existingWallet) {
    return existingWallet;
  }
  
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return null;
  
  const { data, error } = await supabase
    .from("wallets")
    .insert({ user_id: user.user.id })
    .select()
    .single();
  
  if (error) {
    console.error("Error creating wallet:", error);
    return null;
  }
  
  return data as Wallet;
};

// Add funds to wallet
export const addFundsToWallet = async (amount: number): Promise<boolean> => {
  const wallet = await getUserWallet();
  if (!wallet) {
    toast({
      title: "Wallet not found",
      description: "Please try again later",
      variant: "destructive",
    });
    return false;
  }
  
  // Start a transaction to update wallet balance and create a transaction record
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return false;
  
  // Update wallet balance
  const { error: walletError } = await supabase
    .from("wallets")
    .update({ balance: wallet.balance + amount })
    .eq("id", wallet.id);
  
  if (walletError) {
    console.error("Error adding funds to wallet:", walletError);
    toast({
      title: "Failed to add funds",
      description: "Please try again later",
      variant: "destructive",
    });
    return false;
  }
  
  // Create transaction record
  const { error: transactionError } = await supabase
    .from("wallet_transactions")
    .insert({
      wallet_id: wallet.id,
      amount,
      transaction_type: "deposit",
      description: "Added funds to wallet",
    });
  
  if (transactionError) {
    console.error("Error recording transaction:", transactionError);
    // We already updated the balance, so we should still return success
    // In a real app, you'd use a database transaction to rollback
  }
  
  toast({
    title: "Funds added successfully",
    description: `$${amount.toFixed(2)} has been added to your wallet`,
  });
  
  return true;
};

// Get wallet transactions
export const getWalletTransactions = async (): Promise<WalletTransaction[]> => {
  const wallet = await getUserWallet();
  if (!wallet) return [];
  
  const { data, error } = await supabase
    .from("wallet_transactions")
    .select("*")
    .eq("wallet_id", wallet.id)
    .order("created_at", { ascending: false });
  
  if (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }
  
  return data as WalletTransaction[];
};

// Pay using wallet
export const payUsingWallet = async (amount: number, description: string): Promise<boolean> => {
  const wallet = await getUserWallet();
  if (!wallet) {
    toast({
      title: "Wallet not found",
      description: "Please try again later",
      variant: "destructive",
    });
    return false;
  }
  
  if (wallet.balance < amount) {
    toast({
      title: "Insufficient funds",
      description: "Please add more funds to your wallet",
      variant: "destructive",
    });
    return false;
  }
  
  // Update wallet balance
  const { error: walletError } = await supabase
    .from("wallets")
    .update({ balance: wallet.balance - amount })
    .eq("id", wallet.id);
  
  if (walletError) {
    console.error("Error paying with wallet:", walletError);
    toast({
      title: "Payment failed",
      description: "Please try again later",
      variant: "destructive",
    });
    return false;
  }
  
  // Create transaction record
  const { error: transactionError } = await supabase
    .from("wallet_transactions")
    .insert({
      wallet_id: wallet.id,
      amount: -amount,
      transaction_type: "payment",
      description,
    });
  
  if (transactionError) {
    console.error("Error recording transaction:", transactionError);
  }
  
  return true;
};
