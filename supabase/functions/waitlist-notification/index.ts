import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface WaitlistNotificationRequest {
  name: string;
  email: string;
  phone?: string;
  sendToUnsent?: boolean; // Flag to send to all users who haven't received emails
}

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: WaitlistNotificationRequest = await req.json();
    const { name, email, phone, sendToUnsent } = body;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const adminEmail = Deno.env.get("ADMIN_EMAIL");
    
    if (!adminEmail) {
      console.error("ADMIN_EMAIL environment variable not set");
      return new Response(
        JSON.stringify({ error: "Admin email not configured" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // If sendToUnsent flag is set, send to all users who haven't received emails
    if (sendToUnsent) {
      console.log("Sending emails to users who haven't received them yet...");
      
      const { data: unsentUsers, error: fetchError } = await supabase
        .from("waitlist")
        .select("id, name, email, phone")
        .eq("email_sent", false);

      if (fetchError) {
        console.error("Error fetching unsent users:", fetchError);
        throw fetchError;
      }

      console.log(`Found ${unsentUsers?.length || 0} users without emails`);

      const results = [];
      for (const user of unsentUsers || []) {
        try {
          await sendUserConfirmationEmail(user.name, user.email);
          
          // Mark as sent
          await supabase
            .from("waitlist")
            .update({ 
              email_sent: true, 
              email_sent_at: new Date().toISOString() 
            })
            .eq("id", user.id);
          
          results.push({ email: user.email, status: "sent" });
          console.log(`Email sent to ${user.email}`);
        } catch (err) {
          console.error(`Failed to send to ${user.email}:`, err);
          results.push({ email: user.email, status: "failed", error: err.message });
        }
      }

      return new Response(JSON.stringify({ 
        message: `Processed ${results.length} emails`,
        results 
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Single user signup flow
    // Send notification to admin
    const adminEmailResponse = await resend.emails.send({
      from: "Waitlist <onboarding@resend.dev>",
      to: [adminEmail],
      subject: "🎉 New Waitlist Signup!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333; border-bottom: 3px solid #4CAF50; padding-bottom: 10px;">
            New Waitlist Signup 🥦
          </h1>
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #4CAF50; margin-top: 0;">Contact Details:</h2>
            <p style="font-size: 16px; line-height: 1.6;">
              <strong>Name:</strong> ${name}<br>
              <strong>Email:</strong> ${email}<br>
              ${phone ? `<strong>Phone:</strong> ${phone}<br>` : ''}
            </p>
          </div>
          <p style="color: #666; font-size: 14px;">
            This person has joined your waitlist for the Food Basket launch.
          </p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            Sent from your Food Basket Waitlist System
          </p>
        </div>
      `,
    });

    console.log("Admin notification sent successfully:", adminEmailResponse);

    // Send confirmation email to user
    const userEmailResponse = await sendUserConfirmationEmail(name, email);

    console.log("User confirmation sent successfully:", userEmailResponse);

    // Mark email as sent in the database
    const { error: updateError } = await supabase
      .from("waitlist")
      .update({ 
        email_sent: true, 
        email_sent_at: new Date().toISOString() 
      })
      .eq("email", email);

    if (updateError) {
      console.error("Failed to update email_sent status:", updateError);
    }

    return new Response(JSON.stringify({ 
      admin: adminEmailResponse, 
      user: userEmailResponse,
      emailMarkedAsSent: !updateError
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in waitlist-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

// Helper function to send user confirmation email
async function sendUserConfirmationEmail(name: string, email: string) {
  return await resend.emails.send({
    from: "The Food Basket <onboarding@resend.dev>",
    to: [email],
    subject: "🎉 You're on the Waitlist! Welcome to The Food Basket",
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 40px 30px; text-align: center; border-radius: 0 0 30px 30px;">
          <div style="width: 80px; height: 80px; background: white; border-radius: 20px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
            <span style="font-size: 40px;">🛒</span>
          </div>
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">
            Welcome, ${name}! 🎉
          </h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">
            You're officially on the waitlist!
          </p>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px;">
          <div style="background: white; border-radius: 20px; padding: 30px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
            <p style="font-size: 16px; line-height: 1.8; color: #374151; margin: 0 0 20px;">
              Thank you for joining <strong>The Food Basket</strong> waitlist! We're thrilled to have you as part of our growing community of food lovers.
            </p>
            
            <!-- VIP Badge -->
            <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 16px; padding: 20px; text-align: center; margin: 20px 0;">
              <span style="font-size: 24px;">⭐</span>
              <h3 style="color: #92400e; margin: 10px 0 5px; font-size: 18px;">Your Exclusive VIP Benefits</h3>
              <p style="color: #a16207; margin: 0; font-size: 14px;">As an early supporter, you'll receive:</p>
            </div>
            
            <!-- Benefits List -->
            <div style="margin: 25px 0;">
              <div style="display: flex; align-items: center; padding: 12px 0; border-bottom: 1px solid #f3f4f6;">
                <span style="font-size: 20px; margin-right: 15px;">🎁</span>
                <span style="color: #374151; font-size: 15px;"><strong>10% OFF</strong> your first order</span>
              </div>
              <div style="display: flex; align-items: center; padding: 12px 0; border-bottom: 1px solid #f3f4f6;">
                <span style="font-size: 20px; margin-right: 15px;">🚚</span>
                <span style="color: #374151; font-size: 15px;"><strong>FREE delivery</strong> on your first 5 orders</span>
              </div>
              <div style="display: flex; align-items: center; padding: 12px 0; border-bottom: 1px solid #f3f4f6;">
                <span style="font-size: 20px; margin-right: 15px;">⚡</span>
                <span style="color: #374151; font-size: 15px;"><strong>Early access</strong> to flash sales & offers</span>
              </div>
              <div style="display: flex; align-items: center; padding: 12px 0;">
                <span style="font-size: 20px; margin-right: 15px;">🌟</span>
                <span style="color: #374151; font-size: 15px;"><strong>Priority support</strong> when we launch</span>
              </div>
            </div>
            
            <!-- What's Next -->
            <div style="background: #f0fdf4; border-radius: 16px; padding: 20px; margin: 25px 0;">
              <h3 style="color: #166534; margin: 0 0 15px; font-size: 16px;">📬 What Happens Next?</h3>
              <p style="color: #166534; margin: 0; font-size: 14px; line-height: 1.6;">
                We'll keep you updated on our launch progress and send you exclusive early access when we go live. Keep an eye on your inbox!
              </p>
            </div>
          </div>
          
          <!-- Social Proof -->
          <div style="text-align: center; margin: 30px 0 20px;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              🌱 Join <strong>2,800+</strong> others waiting for fresh, local groceries
            </p>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background: #1f2937; padding: 30px; text-align: center; border-radius: 30px 30px 0 0;">
          <p style="color: #9ca3af; margin: 0 0 10px; font-size: 14px;">
            Fresh from the farm to your door 🚚
          </p>
          <p style="color: #6b7280; margin: 0; font-size: 12px;">
            The Food Basket • Nairobi, Kenya
          </p>
        </div>
      </div>
    `,
  });
}

serve(handler);
