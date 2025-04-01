
export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

export interface WalletTransaction {
  id: string;
  walletId: string;
  amount: number;
  transactionType: "deposit" | "payment" | "refund";
  description?: string;
  createdAt: string;
}
