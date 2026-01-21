import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Receipt, Download, Mail, CheckCircle2, Clock, Printer, FileText } from "lucide-react";
import { formatCurrency } from "@/utils/currencyFormatter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getOrderReceipt, getReceiptForOrder, resendReceipt } from "@/services/receiptService";
import { toast } from "sonner";
import { format } from "date-fns";

interface ReceiptCardProps {
  orderId: string;
}

const ReceiptCard = ({ orderId }: ReceiptCardProps) => {
  const queryClient = useQueryClient();
  
  const { data: receipt, isLoading } = useQuery({
    queryKey: ['receipt', orderId],
    queryFn: () => getOrderReceipt(orderId),
  });

  const { data: fullReceipt } = useQuery({
    queryKey: ['fullReceipt', orderId],
    queryFn: () => getReceiptForOrder(orderId),
    enabled: !!receipt,
  });

  const resendMutation = useMutation({
    mutationFn: () => resendReceipt(orderId),
    onSuccess: () => {
      toast.success('Receipt sent successfully');
      queryClient.invalidateQueries({ queryKey: ['receipt', orderId] });
    },
    onError: () => {
      toast.error('Failed to send receipt');
    },
  });

  const handleDownloadReceipt = () => {
    if (!fullReceipt) {
      toast.error('Receipt data not available');
      return;
    }

    // Generate printable HTML
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      toast.error('Pop-up blocked. Please allow pop-ups to download receipt.');
      return;
    }

    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Receipt - ${fullReceipt.receiptNumber}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Segoe UI', Arial, sans-serif; 
            padding: 40px; 
            max-width: 800px; 
            margin: 0 auto; 
            background: #fff;
            color: #1a1a1a;
          }
          .header { 
            text-align: center; 
            padding-bottom: 30px; 
            border-bottom: 3px solid #10b981; 
            margin-bottom: 30px;
          }
          .logo { 
            font-size: 32px; 
            font-weight: bold; 
            color: #10b981; 
            margin-bottom: 5px;
          }
          .tagline { color: #666; font-size: 14px; }
          .receipt-badge { 
            display: inline-block; 
            background: #10b981; 
            color: white; 
            padding: 8px 24px; 
            border-radius: 20px; 
            margin-top: 15px; 
            font-weight: 600;
            font-size: 12px;
            letter-spacing: 1px;
          }
          .info-section { 
            display: flex; 
            justify-content: space-between; 
            margin-bottom: 30px;
            flex-wrap: wrap;
            gap: 20px;
          }
          .info-block { flex: 1; min-width: 200px; }
          .info-block h3 { 
            font-size: 12px; 
            color: #888; 
            text-transform: uppercase; 
            letter-spacing: 0.5px;
            margin-bottom: 8px;
          }
          .info-block p { font-size: 14px; line-height: 1.6; }
          .items-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-bottom: 30px;
          }
          .items-table th { 
            text-align: left; 
            padding: 12px; 
            background: #f8f9fa; 
            font-size: 12px; 
            color: #666;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .items-table th:last-child { text-align: right; }
          .items-table td { 
            padding: 15px 12px; 
            border-bottom: 1px solid #eee;
            font-size: 14px;
          }
          .items-table td:last-child { text-align: right; font-weight: 500; }
          .totals { 
            background: #f8f9fa; 
            padding: 25px;
            border-radius: 12px;
            margin-bottom: 30px;
          }
          .total-row { 
            display: flex; 
            justify-content: space-between; 
            padding: 8px 0;
            font-size: 14px;
          }
          .total-row.discount { color: #10b981; }
          .total-row.final { 
            font-size: 20px; 
            font-weight: bold; 
            border-top: 2px solid #10b981; 
            padding-top: 15px; 
            margin-top: 10px;
          }
          .footer { 
            text-align: center; 
            padding-top: 30px; 
            border-top: 1px solid #eee; 
            color: #888;
            font-size: 13px;
          }
          .footer .thanks { 
            font-size: 18px; 
            color: #10b981; 
            font-weight: 600; 
            margin-bottom: 10px;
          }
          @media print {
            body { padding: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">🛒 The Food Basket</div>
          <div class="tagline">Fresh Groceries Delivered to Your Doorstep</div>
          <div class="receipt-badge">OFFICIAL RECEIPT</div>
        </div>
        
        <div class="info-section">
          <div class="info-block">
            <h3>Receipt Details</h3>
            <p><strong>${fullReceipt.receiptNumber}</strong></p>
            <p>Date: ${format(new Date(fullReceipt.issuedAt), 'PPpp')}</p>
            <p>Order: #${fullReceipt.orderId.substring(0, 8)}</p>
          </div>
          <div class="info-block">
            <h3>Customer</h3>
            <p><strong>${fullReceipt.customerInfo.name}</strong></p>
            <p>${fullReceipt.customerInfo.email}</p>
            ${fullReceipt.customerInfo.phone ? `<p>${fullReceipt.customerInfo.phone}</p>` : ''}
          </div>
          <div class="info-block">
            <h3>Delivery Address</h3>
            <p>${fullReceipt.deliveryAddress}</p>
            <p>Payment: ${fullReceipt.paymentMethod}</p>
          </div>
        </div>
        
        <table class="items-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${fullReceipt.items.map(item => `
              <tr>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>KES ${item.price.toLocaleString()}</td>
                <td>KES ${item.total.toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="totals">
          <div class="total-row">
            <span>Subtotal</span>
            <span>KES ${fullReceipt.subtotal.toLocaleString()}</span>
          </div>
          <div class="total-row">
            <span>Delivery Fee</span>
            <span>KES ${fullReceipt.deliveryFee.toLocaleString()}</span>
          </div>
          ${fullReceipt.discount ? `
          <div class="total-row discount">
            <span>Discount</span>
            <span>-KES ${fullReceipt.discount.toLocaleString()}</span>
          </div>
          ` : ''}
          <div class="total-row final">
            <span>Total Paid</span>
            <span>KES ${fullReceipt.total.toLocaleString()}</span>
          </div>
        </div>
        
        <div class="footer">
          <p class="thanks">Thank you for shopping with us! 🎉</p>
          <p>Questions? Contact us at support@thefoodbasket.com</p>
        </div>
        
        <div class="no-print" style="text-align: center; margin-top: 30px;">
          <button onclick="window.print()" style="
            background: #10b981; 
            color: white; 
            border: none; 
            padding: 12px 32px; 
            border-radius: 8px; 
            font-size: 16px; 
            cursor: pointer;
            font-weight: 500;
          ">
            🖨️ Print Receipt
          </button>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(receiptHTML);
    printWindow.document.close();
    toast.success('Receipt opened for download/print');
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Receipt
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!receipt) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Receipt
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No receipt available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-primary/5 py-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="h-5 w-5 text-primary" />
          Receipt
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div className="space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Receipt Number</p>
              <p className="font-mono font-medium text-sm mt-1">{receipt.receipt_number}</p>
            </div>
            {receipt.sent_at ? (
              <div className="flex items-center gap-1.5 text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Sent</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs bg-secondary text-secondary-foreground px-2.5 py-1 rounded-full">
                <Clock className="h-3.5 w-3.5" />
                <span>Pending</span>
              </div>
            )}
          </div>

          <div className="bg-muted/30 rounded-lg p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Amount</p>
            <p className="text-2xl font-bold text-primary mt-1">{formatCurrency(Number(receipt.total_amount))}</p>
          </div>

          {receipt.email_sent_to && (
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Sent to</p>
              <p className="text-sm mt-1 truncate">{receipt.email_sent_to}</p>
            </div>
          )}

          {receipt.sent_at && (
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Sent on</p>
              <p className="text-sm mt-1">
                {format(new Date(receipt.sent_at), 'PPp')}
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 pt-4 border-t">
          <Button
            variant="default"
            size="sm"
            onClick={handleDownloadReceipt}
            disabled={!fullReceipt}
            className="w-full"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Receipt
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => resendMutation.mutate()}
            disabled={resendMutation.isPending}
            className="w-full"
          >
            <Mail className="h-4 w-4 mr-2" />
            {resendMutation.isPending ? 'Sending...' : 'Resend to Email'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReceiptCard;