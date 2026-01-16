import { supabase } from "@/integrations/supabase/client";

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
    credit_limit: data.credit_limit || 0,
    credit_used: data.credit_used || 0,
    credit_available: (data.credit_limit || 0) - (data.credit_used || 0),
    credit_score: data.credit_score,
    status: data.status
  };
};

export const createBNPLTransaction = async (
  orderId: string,
  amount: number,
  installments: number = 4
): Promise<BNPLTransaction | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  
  // Calculate installment details
  const interestRate = 0; // No interest for now
  const totalAmount = amount * (1 + interestRate / 100);
  const installmentAmount = Math.ceil(totalAmount / installments);
  
  // Calculate due dates
  const today = new Date();
  const nextPaymentDate = new Date(today);
  nextPaymentDate.setDate(nextPaymentDate.getDate() + 7); // First payment in 7 days
  
  const dueDate = new Date(today);
  dueDate.setDate(dueDate.getDate() + (7 * installments)); // Final due date
  
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
      status: 'active'
    })
    .select()
    .single();
    
  if (error) {
    console.error('Error creating BNPL transaction:', error);
    return null;
  }
  
  // Create installment records
  for (let i = 1; i <= installments; i++) {
    const installmentDueDate = new Date(today);
    installmentDueDate.setDate(installmentDueDate.getDate() + (7 * i));
    
    await supabase
      .from('bnpl_installments')
      .insert({
        transaction_id: data.id,
        installment_number: i,
        amount: installmentAmount,
        due_date: installmentDueDate.toISOString().split('T')[0],
        status: 'pending'
      });
  }
  
  // Update credit used
  await supabase
    .from('kyc_verifications')
    .update({ credit_used: supabase.rpc('increment_credit_used', { amount }) })
    .eq('user_id', user.id);
  
  return data;
};

export const getUserBNPLTransactions = async (): Promise<BNPLTransaction[]> => {
  const { data, error } = await supabase
    .from('bnpl_transactions')
    .select('*')
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
  paymentMethod: string
): Promise<boolean> => {
  const { data: installment, error: fetchError } = await supabase
    .from('bnpl_installments')
    .select('*, bnpl_transactions(*)')
    .eq('id', installmentId)
    .single();
    
  if (fetchError || !installment) {
    console.error('Error fetching installment:', fetchError);
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
    return false;
  }
  
  // Update transaction paid amount
  const transaction = installment.bnpl_transactions;
  const newPaidAmount = (transaction.paid_amount || 0) + installment.amount;
  
  const { error: transactionError } = await supabase
    .from('bnpl_transactions')
    .update({
      paid_amount: newPaidAmount,
      status: newPaidAmount >= transaction.total_amount ? 'completed' : 'active'
    })
    .eq('id', transaction.id);
    
  if (transactionError) {
    console.error('Error updating transaction:', transactionError);
    return false;
  }
  
  return true;
};
