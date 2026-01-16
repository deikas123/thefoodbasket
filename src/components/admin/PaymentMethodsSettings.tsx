import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  Smartphone, 
  Wallet, 
  Calendar, 
  Banknote,
  GripVertical
} from "lucide-react";
import { toast } from "sonner";
import { getPaymentSettings, togglePaymentMethod, PaymentSetting } from "@/services/paymentSettingsService";

const iconMap: Record<string, React.ComponentType<any>> = {
  smartphone: Smartphone,
  'credit-card': CreditCard,
  wallet: Wallet,
  calendar: Calendar,
  banknote: Banknote
};

const PaymentMethodsSettings = () => {
  const queryClient = useQueryClient();
  
  const { data: paymentMethods, isLoading } = useQuery({
    queryKey: ['payment-settings'],
    queryFn: getPaymentSettings
  });
  
  const toggleMutation = useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) => 
      togglePaymentMethod(id, enabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-settings'] });
      toast.success('Payment method updated');
    },
    onError: () => toast.error('Failed to update payment method')
  });
  
  const PaymentIcon = ({ icon }: { icon: string | null }) => {
    const IconComponent = iconMap[icon || ''] || CreditCard;
    return <IconComponent className="h-5 w-5" />;
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading payment methods...</div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Methods</CardTitle>
        <CardDescription>
          Enable or disable payment methods available at checkout
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {paymentMethods?.map((method) => (
            <div 
              key={method.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-muted rounded-lg">
                  <PaymentIcon icon={method.icon} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{method.display_name}</h4>
                    {method.payment_method === 'mpesa' && (
                      <Badge variant="secondary" className="text-xs">Popular</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {method.description}
                  </p>
                  {method.processing_fee_percentage > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Processing fee: {method.processing_fee_percentage}%
                      {method.processing_fee_fixed > 0 && ` + KSH ${method.processing_fee_fixed}`}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    id={`toggle-${method.id}`}
                    checked={method.enabled}
                    onCheckedChange={(checked) => 
                      toggleMutation.mutate({ id: method.id, enabled: checked })
                    }
                  />
                  <Label htmlFor={`toggle-${method.id}`} className="sr-only">
                    Enable {method.display_name}
                  </Label>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2">Tips</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• M-Pesa is the most popular payment method in Kenya</li>
            <li>• Buy Now, Pay Later requires KYC verification from customers</li>
            <li>• Cash on Delivery may require additional verification</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentMethodsSettings;
