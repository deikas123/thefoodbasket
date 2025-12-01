import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface STKPushRequest {
  phone: string;
  amount: number;
  orderId?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const lipanaApiKey = Deno.env.get('LIPANA_SECRET_KEY');
    
    if (!lipanaApiKey) {
      console.error('LIPANA_SECRET_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Payment service not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const { phone, amount, orderId }: STKPushRequest = await req.json();

    console.log('Initiating STK push:', { phone, amount, orderId });

    // Validate input
    if (!phone || !amount) {
      return new Response(
        JSON.stringify({ error: 'Phone and amount are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Validate minimum amount
    if (amount < 10) {
      return new Response(
        JSON.stringify({ error: 'Minimum transaction amount is KSh 10' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Format phone number
    let formattedPhone = phone.replace(/\s+/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '254' + formattedPhone.substring(1);
    } else if (!formattedPhone.startsWith('254')) {
      formattedPhone = '254' + formattedPhone;
    }

    // Call Lipana STK push API
    const lipanaResponse = await fetch('https://api.lipana.dev/v1/transactions/push-stk', {
      method: 'POST',
      headers: {
        'x-api-key': lipanaApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: `+${formattedPhone}`,
        amount: Math.round(amount), // Ensure integer amount
      }),
    });

    const responseData = await lipanaResponse.json();

    console.log('Lipana API response:', responseData);

    if (!lipanaResponse.ok) {
      console.error('Lipana API error:', responseData);
      return new Response(
        JSON.stringify({ 
          error: responseData.message || 'Failed to initiate payment',
          details: responseData
        }),
        { status: lipanaResponse.status, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Store transaction reference if order ID is provided
    if (orderId && responseData.data?.transactionId) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Update order with transaction reference
      const { error: updateError } = await supabase
        .from('orders')
        .update({ 
          payment_method: {
            type: 'mpesa',
            transactionId: responseData.data.transactionId,
            checkoutRequestID: responseData.data.checkoutRequestID,
          }
        })
        .eq('id', orderId);

      if (updateError) {
        console.error('Error updating order:', updateError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: responseData.data,
        message: 'STK push initiated successfully. Please check your phone to complete payment.'
      }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );

  } catch (error: any) {
    console.error('Error in mpesa-stk-push function:', error);
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
