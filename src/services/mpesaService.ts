import { supabase } from "@/integrations/supabase/client";

export interface STKPushResponse {
  success: boolean;
  data?: {
    transactionId: string;
    checkoutRequestID: string;
    status: string;
  };
  error?: string;
  message?: string;
}

export const initiateMpesaPayment = async (
  phone: string,
  amount: number,
  orderId?: string
): Promise<STKPushResponse> => {
  try {
    console.log('Initiating M-Pesa payment:', { phone, amount, orderId });

    const { data, error } = await supabase.functions.invoke('mpesa-stk-push', {
      body: {
        phone,
        amount: Math.round(amount),
        orderId,
      },
    });

    if (error) {
      console.error('Error calling mpesa-stk-push function:', error);
      throw new Error(error.message || 'Failed to initiate M-Pesa payment');
    }

    console.log('M-Pesa STK push response:', data);

    return data;
  } catch (error: any) {
    console.error('Error in initiateMpesaPayment:', error);
    throw error;
  }
};
