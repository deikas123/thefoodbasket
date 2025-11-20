import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

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
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, phone }: WaitlistNotificationRequest = await req.json();

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
    const userEmailResponse = await resend.emails.send({
      from: "Food Basket <onboarding@resend.dev>",
      to: [email],
      subject: "Welcome to the Food Basket Waitlist! 🥦",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333; border-bottom: 3px solid #4CAF50; padding-bottom: 10px;">
            Welcome, ${name}! 🎉
          </h1>
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="font-size: 16px; line-height: 1.6;">
              Thank you for joining our waitlist! We're excited to have you as part of our community.
            </p>
            <p style="font-size: 16px; line-height: 1.6;">
              You'll be among the first to know when we launch our farm-fresh Food Baskets, 
              and you'll receive an exclusive <strong style="color: #4CAF50;">10% discount</strong> on your first order!
            </p>
          </div>
          <div style="background-color: #4CAF50; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="color: white; font-size: 16px; margin: 0; text-align: center;">
              🌱 Fresh from the farm to your door 🚚
            </p>
          </div>
          <p style="color: #666; font-size: 14px; line-height: 1.6;">
            We'll keep you updated on our launch date and share exclusive content about our local farmers 
            and sustainable practices.
          </p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            Food Basket - Fresh, Local, Delivered
          </p>
        </div>
      `,
    });

    console.log("User confirmation sent successfully:", userEmailResponse);

    return new Response(JSON.stringify({ 
      admin: adminEmailResponse, 
      user: userEmailResponse 
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

serve(handler);
