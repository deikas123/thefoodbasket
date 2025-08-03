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
  issuedAt: string;
  dueDate?: string;
}

export const generateReceipt = async (order: Order): Promise<Receipt> => {
  try {
    // Get user profile for customer info
    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', order.userId)
      .single();

    // Get user email from auth
    const { data: { user } } = await supabase.auth.getUser();
    
    const receiptNumber = `RCP-${Date.now()}`;
    
    const receipt: Receipt = {
      id: `receipt_${order.id}`,
      orderId: order.id,
      receiptNumber,
      customerInfo: {
        name: profile ? `${profile.first_name} ${profile.last_name}` : 'Customer',
        email: user?.email || 'N/A'
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
      issuedAt: new Date().toISOString()
    };

    // Save receipt to database (you might want to create a receipts table)
    console.log('Receipt generated:', receipt);
    
    // Send receipt via email
    await sendReceiptEmail(receipt);
    
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
        subject: `Receipt for Order #${receipt.orderId}`,
        html: emailHtml,
        receipt
      }
    });

    if (error) {
      console.error('Error sending receipt email:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error sending receipt email:', error);
    throw error;
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
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
        .company-name { font-size: 24px; font-weight: bold; color: #333; }
        .receipt-info { margin-bottom: 30px; }
        .customer-info { margin-bottom: 30px; }
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        .items-table th, .items-table td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        .items-table th { background-color: #f5f5f5; font-weight: bold; }
        .totals { margin-left: auto; width: 300px; }
        .total-row { display: flex; justify-content: space-between; padding: 5px 0; }
        .total-row.final { font-weight: bold; font-size: 18px; border-top: 2px solid #333; padding-top: 10px; }
        .footer { text-align: center; margin-top: 40px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-name">FreshCart</div>
        <div>Your Fresh Grocery Delivery</div>
      </div>
      
      <div class="receipt-info">
        <h2>Receipt</h2>
        <p><strong>Receipt Number:</strong> ${receipt.receiptNumber}</p>
        <p><strong>Order ID:</strong> ${receipt.orderId}</p>
        <p><strong>Date:</strong> ${new Date(receipt.issuedAt).toLocaleDateString()}</p>
        <p><strong>Payment Method:</strong> ${receipt.paymentMethod}</p>
      </div>
      
      <div class="customer-info">
        <h3>Customer Information</h3>
        <p><strong>Name:</strong> ${receipt.customerInfo.name}</p>
        <p><strong>Email:</strong> ${receipt.customerInfo.email}</p>
        ${receipt.customerInfo.phone ? `<p><strong>Phone:</strong> ${receipt.customerInfo.phone}</p>` : ''}
      </div>
      
      <table class="items-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${receipt.items.map(item => `
            <tr>
              <td>${item.name}</td>
              <td>${item.quantity}</td>
              <td>KES ${item.price.toFixed(2)}</td>
              <td>KES ${item.total.toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="totals">
        <div class="total-row">
          <span>Subtotal:</span>
          <span>KES ${receipt.subtotal.toFixed(2)}</span>
        </div>
        <div class="total-row">
          <span>Delivery Fee:</span>
          <span>KES ${receipt.deliveryFee.toFixed(2)}</span>
        </div>
        ${receipt.discount ? `
        <div class="total-row">
          <span>Discount:</span>
          <span>-KES ${receipt.discount.toFixed(2)}</span>
        </div>
        ` : ''}
        <div class="total-row final">
          <span>Total:</span>
          <span>KES ${receipt.total.toFixed(2)}</span>
        </div>
      </div>
      
      <div class="footer">
        <p>Thank you for your business!</p>
        <p>For support, contact us at support@freshcart.com</p>
      </div>
    </body>
    </html>
  `;
};