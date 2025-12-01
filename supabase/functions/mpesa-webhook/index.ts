import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { createHmac } from "https://deno.land/std@0.190.0/node/crypto.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-lipana-signature',
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const signature = req.headers.get('x-lipana-signature');
    const payload = await req.text();
    
    console.log('Webhook received:', payload);
    
    // Verify webhook signature for security (optional but recommended)
    // For now, we'll process the webhook
    
    const data = JSON.parse(payload);
    const { event, data: eventData } = data;

    console.log('Processing webhook event:', event, eventData);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Find the order with this transaction ID
    const { data: orders, error: findError } = await supabase
      .from('orders')
      .select('*')
      .eq('payment_method->>transactionId', eventData.transactionId);

    if (findError) {
      console.error('Error finding order:', findError);
      return new Response(
        JSON.stringify({ error: 'Failed to find order' }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    if (!orders || orders.length === 0) {
      console.log('No order found for transaction:', eventData.transactionId);
      return new Response(
        JSON.stringify({ message: 'No order found' }),
        { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const order = orders[0];

    // Update order status based on payment event
    let newStatus = order.status;
    let updateData: any = {};

    switch (event) {
      case 'payment.success':
      case 'transaction.success':
        newStatus = 'processing';
        updateData = {
          status: newStatus,
          payment_method: {
            ...order.payment_method,
            status: 'paid',
            paidAt: new Date().toISOString(),
          }
        };
        console.log('Payment successful, updating order to processing');
        break;

      case 'payment.failed':
      case 'transaction.failed':
        newStatus = 'cancelled';
        updateData = {
          status: newStatus,
          payment_method: {
            ...order.payment_method,
            status: 'failed',
            failedAt: new Date().toISOString(),
          }
        };
        console.log('Payment failed, cancelling order');
        break;

      case 'payment.pending':
      case 'transaction.pending':
        console.log('Payment pending, no status change needed');
        return new Response(
          JSON.stringify({ message: 'Payment pending' }),
          { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );

      default:
        console.log('Unknown event type:', event);
        return new Response(
          JSON.stringify({ message: 'Unknown event type' }),
          { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
    }

    // Update the order
    const { error: updateError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', order.id);

    if (updateError) {
      console.error('Error updating order:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update order' }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Create notification for the user
    await supabase.from('customer_notifications').insert({
      user_id: order.user_id,
      order_id: order.id,
      title: event === 'payment.success' || event === 'transaction.success' 
        ? 'Payment Successful' 
        : 'Payment Failed',
      message: event === 'payment.success' || event === 'transaction.success'
        ? `Your payment of KSh ${eventData.amount} was successful. Your order is being processed.`
        : `Your payment of KSh ${eventData.amount} failed. Please try again.`,
      type: 'payment_update',
    });

    console.log('Webhook processed successfully');

    return new Response(
      JSON.stringify({ success: true, message: 'Webhook processed' }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );

  } catch (error: any) {
    console.error('Error in mpesa-webhook function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        details: error.toString()
      }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
};

serve(handler);
