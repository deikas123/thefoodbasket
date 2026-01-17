import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Download, Printer, Mail, CheckCircle, Loader2 } from "lucide-react";
import { formatCurrency } from "@/utils/currencyFormatter";
import { format } from "date-fns";
import { toast } from "sonner";

interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
  total: number;
}

interface ReceiptData {
  receiptNumber: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  items: ReceiptItem[];
  subtotal: number;
  deliveryFee: number;
  discount?: number;
  total: number;
  paymentMethod: string;
  issuedAt: string;
  deliveryAddress: string;
}

interface DownloadableReceiptProps {
  receipt: ReceiptData;
  onResend?: () => void;
  isResending?: boolean;
}

const DownloadableReceipt = ({ receipt, onResend, isResending }: DownloadableReceiptProps) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      // Create printable HTML content
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error('Please allow popups to download receipt');
        return;
      }

      const receiptHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Receipt - ${receipt.receiptNumber}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              max-width: 800px; 
              margin: 0 auto; 
              padding: 40px; 
              background: white;
              color: #333;
            }
            .header { 
              text-align: center; 
              border-bottom: 3px solid #10b981; 
              padding-bottom: 30px; 
              margin-bottom: 30px; 
            }
            .logo { 
              font-size: 32px; 
              font-weight: bold; 
              color: #10b981; 
              margin-bottom: 8px;
            }
            .tagline { color: #666; font-size: 14px; }
            .receipt-badge {
              display: inline-block;
              background: #10b981;
              color: white;
              padding: 8px 20px;
              border-radius: 20px;
              font-weight: 600;
              margin-top: 15px;
            }
            .info-grid { 
              display: grid; 
              grid-template-columns: 1fr 1fr; 
              gap: 30px;
              margin-bottom: 30px; 
            }
            .info-section h3 { 
              font-size: 12px; 
              color: #666; 
              text-transform: uppercase;
              letter-spacing: 1px;
              margin-bottom: 10px;
            }
            .info-section p { 
              font-size: 14px; 
              line-height: 1.6;
            }
            .items-table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-bottom: 30px; 
            }
            .items-table th { 
              background: #f8fafc;
              padding: 15px;
              text-align: left;
              font-size: 12px;
              color: #666;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              border-bottom: 2px solid #e2e8f0;
            }
            .items-table td { 
              padding: 15px;
              border-bottom: 1px solid #f1f5f9;
              font-size: 14px;
            }
            .items-table .amount { text-align: right; }
            .totals { 
              margin-left: auto; 
              width: 280px;
              background: #f8fafc;
              padding: 20px;
              border-radius: 8px;
            }
            .total-row { 
              display: flex; 
              justify-content: space-between; 
              padding: 8px 0;
              font-size: 14px;
            }
            .total-row.discount { color: #10b981; }
            .total-row.final { 
              font-weight: bold; 
              font-size: 18px; 
              border-top: 2px solid #10b981; 
              padding-top: 15px; 
              margin-top: 10px;
            }
            .footer { 
              text-align: center; 
              margin-top: 40px; 
              padding-top: 30px;
              border-top: 1px solid #e2e8f0;
              color: #666; 
              font-size: 13px; 
            }
            .footer p { margin: 5px 0; }
            .thank-you {
              font-size: 16px;
              color: #10b981;
              font-weight: 600;
              margin-bottom: 15px;
            }
            @media print {
              body { padding: 20px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">🛒 FreshCart</div>
            <div class="tagline">Fresh Groceries Delivered to Your Doorstep</div>
            <div class="receipt-badge">RECEIPT</div>
          </div>
          
          <div class="info-grid">
            <div class="info-section">
              <h3>Receipt Details</h3>
              <p><strong>Receipt #:</strong> ${receipt.receiptNumber}</p>
              <p><strong>Order ID:</strong> ${receipt.orderId.substring(0, 8)}...</p>
              <p><strong>Date:</strong> ${format(new Date(receipt.issuedAt), 'PPP')}</p>
              <p><strong>Payment:</strong> ${receipt.paymentMethod}</p>
            </div>
            
            <div class="info-section">
              <h3>Customer Information</h3>
              <p><strong>${receipt.customerName}</strong></p>
              <p>${receipt.customerEmail}</p>
              ${receipt.customerPhone ? `<p>${receipt.customerPhone}</p>` : ''}
              <p style="margin-top: 10px; font-size: 13px; color: #666;">${receipt.deliveryAddress}</p>
            </div>
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
              <span>Delivery:</span>
              <span>KES ${receipt.deliveryFee.toLocaleString()}</span>
            </div>
            ${receipt.discount ? `
            <div class="total-row discount">
              <span>Discount:</span>
              <span>-KES ${receipt.discount.toLocaleString()}</span>
            </div>
            ` : ''}
            <div class="total-row final">
              <span>Total:</span>
              <span>KES ${receipt.total.toLocaleString()}</span>
            </div>
          </div>
          
          <div class="footer">
            <p class="thank-you">Thank you for shopping with FreshCart! 🎉</p>
            <p>Questions? Contact us at support@freshcart.com</p>
            <p>Visit us at freshcart.com</p>
          </div>
          
          <script>
            window.onload = function() { 
              window.print(); 
            }
          </script>
        </body>
        </html>
      `;

      printWindow.document.write(receiptHTML);
      printWindow.document.close();
      toast.success('Receipt opened for download/print');
    } catch (error) {
      console.error('Error generating receipt:', error);
      toast.error('Failed to generate receipt');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="border-2 border-dashed">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">Receipt</CardTitle>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <CheckCircle className="h-3 w-3 mr-1" />
              Generated
            </Badge>
          </div>
          <span className="text-sm font-mono text-muted-foreground">
            {receipt.receiptNumber}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Customer</p>
            <p className="font-medium">{receipt.customerName}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Date</p>
            <p className="font-medium">{format(new Date(receipt.issuedAt), 'PPp')}</p>
          </div>
        </div>

        <Separator />

        {/* Items Preview */}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Items ({receipt.items.length})</p>
          <div className="space-y-1">
            {receipt.items.slice(0, 3).map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span>{item.name} x{item.quantity}</span>
                <span>{formatCurrency(item.total)}</span>
              </div>
            ))}
            {receipt.items.length > 3 && (
              <p className="text-xs text-muted-foreground">
                +{receipt.items.length - 3} more items
              </p>
            )}
          </div>
        </div>

        <Separator />

        {/* Total */}
        <div className="flex justify-between items-center font-semibold">
          <span>Total Paid</span>
          <span className="text-lg text-green-600">{formatCurrency(receipt.total)}</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button 
            onClick={generatePDF} 
            disabled={isGenerating}
            className="flex-1"
            variant="outline"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Download
          </Button>
          <Button 
            onClick={generatePDF}
            disabled={isGenerating}
            variant="outline"
          >
            <Printer className="h-4 w-4" />
          </Button>
          {onResend && (
            <Button 
              onClick={onResend}
              disabled={isResending}
              variant="outline"
            >
              {isResending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Mail className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DownloadableReceipt;
