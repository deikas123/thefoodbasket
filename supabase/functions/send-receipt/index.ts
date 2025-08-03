import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Send receipt function called');
    
    const { to, subject, html, receipt } = await req.json();

    if (!to || !subject || !html) {
      console.error('Missing required fields:', { to: !!to, subject: !!subject, html: !!html });
      return new Response(
        JSON.stringify({ error: 'Missing required fields: to, subject, html' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Sending receipt email to:', to);

    const emailResponse = await resend.emails.send({
      from: "FreshCart <receipts@freshcart.com>",
      to: [to],
      subject: subject,
      html: html,
      attachments: []
    });

    if (emailResponse.error) {
      console.error('Resend error:', emailResponse.error);
      throw new Error(emailResponse.error.message);
    }

    console.log('Receipt email sent successfully:', emailResponse.data);

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: emailResponse.data.id,
        receiptNumber: receipt.receiptNumber 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in send-receipt function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});