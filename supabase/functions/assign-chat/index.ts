import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Assign chat function called');
    
    // Create a Supabase client with service role key for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Verify the requesting user is customer service or admin
    const authHeader = req.headers.get('Authorization')!
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if user has customer_service or admin role
    const { data: userRole, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (roleError || !userRole || (userRole.role !== 'customer_service' && userRole.role !== 'admin')) {
      return new Response(
        JSON.stringify({ error: 'Customer service or admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { chatId, action } = await req.json()

    if (!chatId || !action) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: chatId, action' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let updateData = {}
    
    if (action === 'assign') {
      updateData = {
        customer_service_id: user.id,
        status: 'assigned',
        updated_at: new Date().toISOString()
      }
    } else if (action === 'resolve') {
      updateData = {
        status: 'resolved',
        updated_at: new Date().toISOString()
      }
    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid action. Use "assign" or "resolve"' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Update the chat
    const { data: updatedChat, error: updateError } = await supabaseAdmin
      .from('customer_chats')
      .update(updateData)
      .eq('id', chatId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating chat:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update chat: ' + updateError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Chat updated successfully:', updatedChat);

    return new Response(
      JSON.stringify({ 
        success: true, 
        chat: updatedChat,
        action: action
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error: ' + error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})