import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.3";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface FlashSaleNotificationRequest {
  flashSaleId: string;
  flashSaleName: string;
  discountPercentage: number;
  endDate: string;
  productCount: number;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { 
      flashSaleId, 
      flashSaleName, 
      discountPercentage, 
      endDate,
      productCount 
    }: FlashSaleNotificationRequest = await req.json();

    console.log(`Sending flash sale notification for: ${flashSaleName}`);

    // Get all users who have opted in for promotional emails
    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("email, first_name")
      .eq("notification_promo_email", true)
      .not("email", "is", null);

    if (profileError) {
      console.error("Error fetching profiles:", profileError);
      throw profileError;
    }

    if (!profiles || profiles.length === 0) {
      console.log("No users opted in for promotional emails");
      return new Response(
        JSON.stringify({ message: "No users to notify", count: 0 }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const formattedEndDate = new Date(endDate).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    let successCount = 0;
    const errors: string[] = [];

    // Send emails in batches of 10
    const batchSize = 10;
    for (let i = 0; i < profiles.length; i += batchSize) {
      const batch = profiles.slice(i, i + batchSize);
      
      const emailPromises = batch.map(async (profile) => {
        const customerName = profile.first_name || "Valued Customer";
        
        try {
          await resend.emails.send({
            from: "Flash Sale Alert <onboarding@resend.dev>",
            to: [profile.email!],
            subject: `🔥 ${discountPercentage}% OFF - ${flashSaleName} Starts Now!`,
            html: `
              <!DOCTYPE html>
              <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
              </head>
              <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); border-radius: 16px; padding: 40px 30px; text-align: center; margin-bottom: 30px;">
                  <h1 style="color: white; font-size: 28px; margin: 0 0 10px 0;">⚡ Flash Sale Alert!</h1>
                  <p style="color: rgba(255,255,255,0.9); font-size: 16px; margin: 0;">${flashSaleName}</p>
                </div>
                
                <div style="background: #fff; border-radius: 12px; padding: 30px; border: 1px solid #e5e7eb;">
                  <p style="font-size: 18px; margin-top: 0;">Hi ${customerName}! 👋</p>
                  
                  <p>Great news! We've just launched an exclusive flash sale with incredible savings!</p>
                  
                  <div style="background: #fef2f2; border-radius: 12px; padding: 25px; text-align: center; margin: 25px 0;">
                    <p style="font-size: 48px; font-weight: bold; color: #ef4444; margin: 0;">${discountPercentage}% OFF</p>
                    <p style="color: #991b1b; margin: 10px 0 0 0;">on ${productCount} selected products</p>
                  </div>
                  
                  <p><strong>⏰ Hurry!</strong> This sale ends on ${formattedEndDate}</p>
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${supabaseUrl.replace('.supabase.co', '')}/flash-sales" 
                       style="display: inline-block; background: #ef4444; color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                      Shop Flash Sale Now →
                    </a>
                  </div>
                  
                  <p style="font-size: 14px; color: #6b7280; margin-bottom: 0;">Don't miss out on these limited-time deals. Stock is limited!</p>
                </div>
                
                <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                  <p style="font-size: 12px; color: #9ca3af; margin: 0;">
                    You received this email because you're subscribed to promotional emails.<br>
                    <a href="#" style="color: #6b7280;">Unsubscribe</a> from promotional emails.
                  </p>
                </div>
              </body>
              </html>
            `,
          });
          successCount++;
        } catch (emailError: any) {
          console.error(`Failed to send to ${profile.email}:`, emailError);
          errors.push(`${profile.email}: ${emailError.message}`);
        }
      });

      await Promise.all(emailPromises);
    }

    console.log(`Successfully sent ${successCount} emails for flash sale: ${flashSaleName}`);

    return new Response(
      JSON.stringify({ 
        message: `Flash sale notifications sent`, 
        successCount,
        totalRecipients: profiles.length,
        errors: errors.length > 0 ? errors : undefined
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in flash-sale-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
