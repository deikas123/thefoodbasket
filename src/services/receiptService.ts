import { supabase } from "@/integrations/supabase/client";
import { Order } from "@/types/order";

export interface Receipt {
  id: string;
  orderId: string;
  receiptNumber: string;
  customerInfo: {
    name: string;
    email: string;
    phone?: string;
  };
  items: {
    name: string;
    quantity: number;
    price: number;
    total: number;
  }[];
  subtotal: number;
  deliveryFee: number;
  discount?: number;
  total: number;
  paymentMethod: string;
  deliveryAddress: string;
  issuedAt: string;
  dueDate?: string;
}

export const generateReceipt = async (order: Order): Promise<Receipt> => {
  try {
    // Get user profile for customer info
    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name, last_name, phone')
      .eq('id', order.userId)
      .single();

    // Get user email from auth
    const { data: { user } } = await supabase.auth.getUser();
    
    const receiptNumber = `RCP-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    
    // Format delivery address
    const deliveryAddr = order.deliveryAddress;
    const formattedAddress = typeof deliveryAddr === 'object' 
      ? `${(deliveryAddr as any).street || ''}, ${(deliveryAddr as any).city || ''}, ${(deliveryAddr as any).state || ''}`
      : 'N/A';
    
    const receipt: Receipt = {
      id: `receipt_${order.id}`,
      orderId: order.id,
      receiptNumber,
      customerInfo: {
        name: profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Customer' : 'Customer',
        email: user?.email || 'N/A',
        phone: profile?.phone || undefined
      },
      items: order.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity
      })),
      subtotal: order.subtotal,
      deliveryFee: order.deliveryFee,
      discount: order.discount,
      total: order.total,
      paymentMethod: order.paymentMethod.name,
      deliveryAddress: formattedAddress,
      issuedAt: new Date().toISOString()
    };

    console.log('Generated receipt:', receipt);
    
    // Save receipt to database
    const { data: savedReceipt, error: saveError } = await supabase
      .from('receipts')
      .insert({
        order_id: order.id,
        user_id: order.userId,
        receipt_number: receipt.receiptNumber,
        total_amount: receipt.total,
        email_sent_to: receipt.customerInfo.email,
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving receipt to database:', saveError);
    }
    
    // Send receipt via email
    await sendReceiptEmail(receipt);
    
    // Update receipt as sent
    if (savedReceipt) {
      await supabase
        .from('receipts')
        .update({ sent_at: new Date().toISOString() })
        .eq('id', savedReceipt.id);
    }
    
    return receipt;
  } catch (error) {
    console.error('Error generating receipt:', error);
    throw error;
  }
};

export const sendReceiptEmail = async (receipt: Receipt): Promise<void> => {
  try {
    const emailHtml = generateReceiptHTML(receipt);
    
    // Call email sending edge function
    const { error } = await supabase.functions.invoke('send-receipt', {
      body: {
        to: receipt.customerInfo.email,
        subject: `Your FreshCart Receipt - Order #${receipt.orderId.substring(0, 8)}`,
        html: emailHtml,
        receipt
      }
    });

    if (error) {
      console.error('Error sending receipt email:', error);
      // Don't throw - email sending is optional
    }
  } catch (error) {
    console.error('Error sending receipt email:', error);
    // Don't throw - email sending is optional
  }
};

const generateReceiptHTML = (receipt: Receipt): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Receipt</title>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5; }
        .container { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px 20px; }
        .company-name { font-size: 28px; font-weight: bold; margin-bottom: 5px; }
        .tagline { opacity: 0.9; font-size: 14px; }
        .receipt-badge { display: inline-block; background: rgba(255,255,255,0.2); padding: 8px 20px; border-radius: 20px; margin-top: 15px; font-weight: 600; }
        .content { padding: 30px; }
        .receipt-info { margin-bottom: 25px; }
        .info-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
        .info-label { color: #666; }
        .customer-info { background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 25px; }
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
        .items-table th { text-align: left; padding: 12px 0; border-bottom: 2px solid #e2e8f0; font-size: 12px; color: #666; text-transform: uppercase; }
        .items-table td { padding: 12px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
        .items-table .amount { text-align: right; }
        .totals { background: #f8fafc; padding: 20px; border-radius: 8px; }
        .total-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; }
        .total-row.discount { color: #10b981; }
        .total-row.final { font-weight: bold; font-size: 18px; border-top: 2px solid #10b981; padding-top: 15px; margin-top: 10px; }
        .footer { text-align: center; padding: 25px; background: #f8fafc; color: #666; font-size: 13px; }
        .thank-you { font-size: 16px; color: #10b981; font-weight: 600; margin-bottom: 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="company-name">🛒 FreshCart</div>
          <div class="tagline">Fresh Groceries Delivered to Your Doorstep</div>
          <div class="receipt-badge">RECEIPT</div>
        </div>
        
        <div class="content">
          <div class="receipt-info">
            <div class="info-row">
              <span class="info-label">Receipt Number:</span>
              <span><strong>${receipt.receiptNumber}</strong></span>
            </div>
            <div class="info-row">
              <span class="info-label">Order ID:</span>
              <span>${receipt.orderId.substring(0, 8)}...</span>
            </div>
            <div class="info-row">
              <span class="info-label">Date:</span>
              <span>${new Date(receipt.issuedAt).toLocaleDateString('en-US', { 
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
              })}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Payment Method:</span>
              <span>${receipt.paymentMethod}</span>
            </div>
          </div>
          
          <div class="customer-info">
            <div style="font-weight: 600; margin-bottom: 8px;">${receipt.customerInfo.name}</div>
            <div style="font-size: 14px; color: #666;">${receipt.customerInfo.email}</div>
            ${receipt.customerInfo.phone ? `<div style="font-size: 14px; color: #666;">${receipt.customerInfo.phone}</div>` : ''}
            <div style="font-size: 13px; color: #888; margin-top: 8px;">📍 ${receipt.deliveryAddress}</div>
          </div>
          
          <table class="items-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th class="amount">Price</th>
                <th class="amount">Total</th>
              </tr>
            </thead>
            <tbody>
              ${receipt.items.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.quantity}</td>
                  <td class="amount">KES ${item.price.toLocaleString()}</td>
                  <td class="amount">KES ${item.total.toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="totals">
            <div class="total-row">
              <span>Subtotal:</span>
              <span>KES ${receipt.subtotal.toLocaleString()}</span>
            </div>
            <div class="total-row">
              <span>Delivery Fee:</span>
              <span>KES ${receipt.deliveryFee.toLocaleString()}</span>
            </div>
            ${receipt.discount ? `
            <div class="total-row discount">
              <span>Discount:</span>
              <span>-KES ${receipt.discount.toLocaleString()}</span>
            </div>
            ` : ''}
            <div class="total-row final">
              <span>Total Paid:</span>
              <span>KES ${receipt.total.toLocaleString()}</span>
            </div>
          </div>
        </div>
        
        <div class="footer">
          <p class="thank-you">Thank you for shopping with FreshCart! 🎉</p>
          <p>Questions? Contact us at support@freshcart.com</p>
          <p>Visit us at freshcart.com</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const getOrderReceipt = async (orderId: string) => {
  const { data, error } = await supabase
    .from('receipts')
    .select('*')
    .eq('order_id', orderId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching receipt:', error);
    return null;
  }

  return data;
};

export const getReceiptForOrder = async (orderId: string): Promise<Receipt | null> => {
  // Get receipt record
  const { data: receiptData, error: receiptError } = await supabase
    .from('receipts')
    .select('*')
    .eq('order_id', orderId)
    .maybeSingle();

  if (receiptError || !receiptData) {
    return null;
  }

  // Get order details
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (orderError || !order) {
    return null;
  }

  // Get profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name, phone')
    .eq('id', order.user_id)
    .single();

  const items = (order.items as any[]).map((item: any) => ({
    name: item.name,
    quantity: item.quantity,
    price: item.price,
    total: item.price * item.quantity
  }));

  const deliveryAddr = order.delivery_address;
  const formattedAddress = typeof deliveryAddr === 'object' 
    ? `${(deliveryAddr as any).street || ''}, ${(deliveryAddr as any).city || ''}, ${(deliveryAddr as any).state || ''}`
    : 'N/A';

  return {
    id: receiptData.id,
    orderId: order.id,
    receiptNumber: receiptData.receipt_number,
    customerInfo: {
      name: profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Customer' : 'Customer',
      email: receiptData.email_sent_to || 'N/A',
      phone: profile?.phone || undefined
    },
    items,
    subtotal: order.subtotal,
    deliveryFee: order.delivery_fee,
    discount: order.discount || undefined,
    total: order.total,
    paymentMethod: (order.payment_method as any)?.name || 'N/A',
    deliveryAddress: formattedAddress,
    issuedAt: receiptData.created_at
  };
};

export const resendReceipt = async (orderId: string): Promise<void> => {
  const receipt = await getReceiptForOrder(orderId);
  if (!receipt) {
    throw new Error('Receipt not found');
  }
  await sendReceiptEmail(receipt);
};

// Auto-generate receipt when order is placed
export const autoGenerateReceipt = async (orderId: string): Promise<Receipt | null> => {
  try {
    // Check if receipt already exists
    const existingReceipt = await getOrderReceipt(orderId);
    if (existingReceipt) {
      console.log('Receipt already exists for order:', orderId);
      return await getReceiptForOrder(orderId);
    }

    // Get order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      console.error('Order not found:', orderError);
      return null;
    }

    // Convert to Order type
    const orderData: Order = {
      id: order.id,
      userId: order.user_id,
      items: order.items as any[],
      subtotal: order.subtotal,
      deliveryFee: order.delivery_fee,
      discount: order.discount || 0,
      total: order.total,
      status: order.status as any,
      deliveryMethod: order.delivery_method as any,
      deliveryAddress: order.delivery_address as any,
      paymentMethod: order.payment_method as any,
      estimatedDelivery: order.estimated_delivery,
      createdAt: order.created_at,
      updatedAt: order.updated_at
    };

    return await generateReceipt(orderData);
  } catch (error) {
    console.error('Error auto-generating receipt:', error);
    return null;
  }
};
