
import { supabase } from "@/integrations/supabase/client";
import { Wallet, WalletTransaction } from "@/types/wallet";
import { toast } from "@/hooks/use-toast";
import { Database } from "@/types/database.types";

// Get user wallet
export const getUserWallet = async (): Promise<Wallet | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error("No authenticated user found");
      return null;
    }

    const { data, error } = await supabase
      .from("wallets")
      .select("*")
      .eq("user_id", user.id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No wallet found, this is expected for new users
        return null;
      }
      console.error("Error fetching wallet:", error);
      return null;
    }
    
    // Map database response to Wallet type
    const wallet = data as Database['public']['Tables']['wallets']['Row'];
    return {
      id: wallet.id,
      userId: wallet.user_id,
      balance: wallet.balance,
      createdAt: wallet.created_at,
      updatedAt: wallet.updated_at
    };
  } catch (error) {
    console.error("Error in getUserWallet:", error);
    return null;
  }
};

// Create wallet for user if it doesn't exist
export const createWalletIfNotExist = async (): Promise<Wallet | null> => {
  try {
    const existingWallet = await getUserWallet();
    
    if (existingWallet) {
      return existingWallet;
    }
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error("No authenticated user found");
      return null;
    }
    
    const { data, error } = await supabase
      .from("wallets")
      .insert({ user_id: user.id, balance: 0.00 })
      .select()
      .single();
    
    if (error) {
      console.error("Error creating wallet:", error);
      return null;
    }

    // Map database response to Wallet type
    const wallet = data as Database['public']['Tables']['wallets']['Row'];
    return {
      id: wallet.id,
      userId: wallet.user_id,
      balance: wallet.balance,
      createdAt: wallet.created_at,
      updatedAt: wallet.updated_at
    };
  } catch (error) {
    console.error("Error in createWalletIfNotExist:", error);
    return null;
  }
};

// Add funds to wallet
export const addFundsToWallet = async (amount: number): Promise<boolean> => {
  try {
    const wallet = await getUserWallet();
    if (!wallet) {
      // Try to create wallet if it doesn't exist
      const newWallet = await createWalletIfNotExist();
      if (!newWallet) {
        toast({
          title: "Wallet not found",
          description: "Unable to create or access wallet. Please try again later.",
          variant: "destructive",
        });
        return false;
      }
    }

    const currentWallet = wallet || await getUserWallet();
    if (!currentWallet) {
      toast({
        title: "Wallet error",
        description: "Unable to access wallet. Please try again later.",
        variant: "destructive",
      });
      return false;
    }
    
    // Update wallet balance
    const { error: walletError } = await supabase
      .from("wallets")
      .update({ balance: currentWallet.balance + amount })
      .eq("id", currentWallet.id);
    
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
        wallet_id: currentWallet.id,
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
  } catch (error) {
    console.error("Error in addFundsToWallet:", error);
    toast({
      title: "Failed to add funds",
      description: "An unexpected error occurred. Please try again later.",
      variant: "destructive",
    });
    return false;
  }
};

// Get wallet transactions
export const getWalletTransactions = async (): Promise<WalletTransaction[]> => {
  try {
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
    
    // Map database response to WalletTransaction[] type
    return (data as Database['public']['Tables']['wallet_transactions']['Row'][]).map(item => ({
      id: item.id,
      walletId: item.wallet_id,
      amount: item.amount,
      transactionType: item.transaction_type as "deposit" | "payment" | "refund",
      description: item.description || undefined,
      createdAt: item.created_at
    }));
  } catch (error) {
    console.error("Error in getWalletTransactions:", error);
    return [];
  }
};

// Pay using wallet
export const payUsingWallet = async (amount: number, description: string): Promise<boolean> => {
  try {
    const wallet = await getUserWallet();
    if (!wallet) {
      toast({
        title: "Wallet not found",
        description: "Please add funds to your wallet first",
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
  } catch (error) {
    console.error("Error in payUsingWallet:", error);
    toast({
      title: "Payment failed",
      description: "An unexpected error occurred. Please try again later.",
      variant: "destructive",
    });
    return false;
  }
};
