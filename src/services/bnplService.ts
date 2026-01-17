import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface BNPLTransaction {
  id: string;
  user_id: string;
  order_id: string | null;
  principal_amount: number;
  total_amount: number;
  paid_amount: number;
  interest_rate: number;
  installments: number;
  installment_amount: number;
  next_payment_date: string;
  due_date: string;
  status: 'active' | 'completed' | 'overdue' | 'defaulted' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface BNPLInstallment {
  id: string;
  transaction_id: string;
  installment_number: number;
  amount: number;
  due_date: string;
  paid_at: string | null;
  payment_method: string | null;
  status: 'pending' | 'paid' | 'overdue' | 'waived';
  created_at: string;
}

export interface CreditInfo {
  credit_limit: number;
  credit_used: number;
  credit_available: number;
  credit_score: number | null;
  status: string;
}

export const getUserCreditInfo = async (): Promise<CreditInfo | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  
  const { data, error } = await supabase
    .from('kyc_verifications')
    .select('credit_limit, credit_used, credit_score, status')
    .eq('user_id', user.id)
    .single();
    
  if (error || !data) {
    return null;
  }
  
  return {
    credit_limit: data.credit_limit || 10000,
    credit_used: data.credit_used || 0,
    credit_available: (data.credit_limit || 10000) - (data.credit_used || 0),
    credit_score: data.credit_score,
    status: data.status
  };
};

export const checkBNPLEligibility = async (amount: number): Promise<{ eligible: boolean; reason?: string }> => {
  const creditInfo = await getUserCreditInfo();
  
  if (!creditInfo) {
    return { eligible: false, reason: 'Please complete KYC verification to use Buy Now, Pay Later' };
  }
  
  if (creditInfo.status !== 'approved') {
    return { eligible: false, reason: 'Your KYC verification is pending or was rejected' };
  }
  
  if (amount > creditInfo.credit_available) {
    return { 
      eligible: false, 
      reason: `Amount exceeds your available credit (KES ${creditInfo.credit_available.toLocaleString()})` 
    };
  }
  
  return { eligible: true };
};

export const createBNPLTransaction = async (
  orderId: string,
  amount: number,
  installments: number = 4
): Promise<BNPLTransaction | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    toast.error('Please login to use Buy Now, Pay Later');
    return null;
  }
  
  // Check eligibility
  const eligibility = await checkBNPLEligibility(amount);
  if (!eligibility.eligible) {
    toast.error(eligibility.reason);
    return null;
  }
  
  // Calculate installment details
  const interestRate = 0; // No interest for now
  const totalAmount = amount * (1 + interestRate / 100);
  const installmentAmount = Math.ceil(totalAmount / installments);
  
  // Calculate due dates
  const today = new Date();
  const nextPaymentDate = new Date(today);
  nextPaymentDate.setDate(nextPaymentDate.getDate() + 7);
  
  const dueDate = new Date(today);
  dueDate.setDate(dueDate.getDate() + (7 * installments));
  
  const { data, error } = await supabase
    .from('bnpl_transactions')
    .insert({
      user_id: user.id,
      order_id: orderId,
      principal_amount: amount,
      total_amount: totalAmount,
      interest_rate: interestRate,
      installments,
      installment_amount: installmentAmount,
      next_payment_date: nextPaymentDate.toISOString().split('T')[0],
      due_date: dueDate.toISOString().split('T')[0],
      status: 'active',
      paid_amount: 0
    })
    .select()
    .single();
    
  if (error) {
    console.error('Error creating BNPL transaction:', error);
    toast.error('Failed to create payment plan');
    return null;
  }
  
  // Create installment records
  const installmentPromises = [];
  for (let i = 1; i <= installments; i++) {
    const installmentDueDate = new Date(today);
    installmentDueDate.setDate(installmentDueDate.getDate() + (7 * i));
    
    installmentPromises.push(
      supabase.from('bnpl_installments').insert({
        transaction_id: data.id,
        installment_number: i,
        amount: installmentAmount,
        due_date: installmentDueDate.toISOString().split('T')[0],
        status: 'pending'
      })
    );
  }
  
  await Promise.all(installmentPromises);
  
  // Update credit used
  const creditInfo = await getUserCreditInfo();
  if (creditInfo) {
    await supabase
      .from('kyc_verifications')
      .update({ credit_used: (creditInfo.credit_used || 0) + amount })
      .eq('user_id', user.id);
  }
  
  toast.success(`Payment plan created! Pay KES ${installmentAmount.toLocaleString()} weekly for ${installments} weeks`);
  
  return data;
};

export const getUserBNPLTransactions = async (): Promise<BNPLTransaction[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  
  const { data, error } = await supabase
    .from('bnpl_transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching BNPL transactions:', error);
    return [];
  }
  
  return data || [];
};

export const getTransactionInstallments = async (
  transactionId: string
): Promise<BNPLInstallment[]> => {
  const { data, error } = await supabase
    .from('bnpl_installments')
    .select('*')
    .eq('transaction_id', transactionId)
    .order('installment_number');
    
  if (error) {
    console.error('Error fetching installments:', error);
    return [];
  }
  
  return data || [];
};

export const payInstallment = async (
  installmentId: string,
  paymentMethod: string = 'mpesa'
): Promise<boolean> => {
  const { data: installment, error: fetchError } = await supabase
    .from('bnpl_installments')
    .select('*')
    .eq('id', installmentId)
    .single();
    
  if (fetchError || !installment) {
    console.error('Error fetching installment:', fetchError);
    toast.error('Installment not found');
    return false;
  }
  
  // Get transaction
  const { data: transaction, error: transError } = await supabase
    .from('bnpl_transactions')
    .select('*')
    .eq('id', installment.transaction_id)
    .single();
    
  if (transError || !transaction) {
    toast.error('Transaction not found');
    return false;
  }
  
  // Update installment
  const { error: updateError } = await supabase
    .from('bnpl_installments')
    .update({
      status: 'paid',
      paid_at: new Date().toISOString(),
      payment_method: paymentMethod
    })
    .eq('id', installmentId);
    
  if (updateError) {
    console.error('Error updating installment:', updateError);
    toast.error('Payment failed');
    return false;
  }
  
  // Update transaction paid amount
  const newPaidAmount = (transaction.paid_amount || 0) + installment.amount;
  const isComplete = newPaidAmount >= transaction.total_amount;
  
  const { error: transactionError } = await supabase
    .from('bnpl_transactions')
    .update({
      paid_amount: newPaidAmount,
      status: isComplete ? 'completed' : 'active',
      next_payment_date: isComplete ? null : getNextPaymentDate(installment.transaction_id)
    })
    .eq('id', transaction.id);
    
  if (transactionError) {
    console.error('Error updating transaction:', transactionError);
  }
  
  // Release credit if completed
  if (isComplete) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const creditInfo = await getUserCreditInfo();
      if (creditInfo) {
        await supabase
          .from('kyc_verifications')
          .update({ credit_used: Math.max(0, (creditInfo.credit_used || 0) - transaction.principal_amount) })
          .eq('user_id', user.id);
      }
    }
    toast.success('Congratulations! You have fully paid off this order!');
  } else {
    toast.success('Payment successful!');
  }
  
  return true;
};

const getNextPaymentDate = async (transactionId: string): Promise<string | null> => {
  const { data } = await supabase
    .from('bnpl_installments')
    .select('due_date')
    .eq('transaction_id', transactionId)
    .eq('status', 'pending')
    .order('installment_number')
    .limit(1)
    .single();
    
  return data?.due_date || null;
};
