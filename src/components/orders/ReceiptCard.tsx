import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Receipt, Download, Mail, CheckCircle2, Clock } from "lucide-react";
import { formatCurrency } from "@/utils/currencyFormatter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getOrderReceipt, resendReceipt } from "@/services/receiptService";
import { toast } from "sonner";

interface ReceiptCardProps {
  orderId: string;
}

const ReceiptCard = ({ orderId }: ReceiptCardProps) => {
  const queryClient = useQueryClient();
  
  const { data: receipt, isLoading } = useQuery({
    queryKey: ['receipt', orderId],
    queryFn: () => getOrderReceipt(orderId),
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
    <Card>
      <CardHeader className="bg-muted/10 py-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Receipt className="h-5 w-5" />
          Receipt
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-muted-foreground">Receipt Number</p>
              <p className="font-mono font-medium">{receipt.receipt_number}</p>
            </div>
            {receipt.sent_at ? (
              <div className="flex items-center gap-1 text-sm text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                <span>Sent</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-sm text-orange-600">
                <Clock className="h-4 w-4" />
                <span>Pending</span>
              </div>
            )}
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Total Amount</p>
            <p className="text-2xl font-bold">{formatCurrency(Number(receipt.total_amount))}</p>
          </div>

          {receipt.email_sent_to && (
            <div>
              <p className="text-sm text-muted-foreground">Sent to</p>
              <p className="text-sm">{receipt.email_sent_to}</p>
            </div>
          )}

          {receipt.sent_at && (
            <div>
              <p className="text-sm text-muted-foreground">Sent on</p>
              <p className="text-sm">
                {new Date(receipt.sent_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => resendMutation.mutate()}
            disabled={resendMutation.isPending}
            className="w-full"
          >
            <Mail className="h-4 w-4 mr-2" />
            {resendMutation.isPending ? 'Sending...' : 'Resend Receipt'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReceiptCard;