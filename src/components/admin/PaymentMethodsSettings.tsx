import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CreditCard, 
  Smartphone, 
  Wallet, 
  Calendar, 
  Banknote,
  Settings,
  Edit,
  Save,
  AlertCircle,
  CheckCircle,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { getPaymentSettings, updatePaymentSetting, togglePaymentMethod, PaymentSetting } from "@/services/paymentSettingsService";

const iconMap: Record<string, React.ComponentType<any>> = {
  smartphone: Smartphone,
  'credit-card': CreditCard,
  wallet: Wallet,
  calendar: Calendar,
  banknote: Banknote
};

const PaymentMethodsSettings = () => {
  const queryClient = useQueryClient();
  const [editingMethod, setEditingMethod] = useState<PaymentSetting | null>(null);
  const [editForm, setEditForm] = useState({
    display_name: '',
    description: '',
    processing_fee_percentage: 0,
    processing_fee_fixed: 0,
    min_amount: 0,
    max_amount: 0
  });
  
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

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<PaymentSetting> }) =>
      updatePaymentSetting(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-settings'] });
      toast.success('Payment method settings saved');
      setEditingMethod(null);
    },
    onError: () => toast.error('Failed to save settings')
  });

  const openEditDialog = (method: PaymentSetting) => {
    setEditingMethod(method);
    setEditForm({
      display_name: method.display_name,
      description: method.description || '',
      processing_fee_percentage: method.processing_fee_percentage,
      processing_fee_fixed: method.processing_fee_fixed,
      min_amount: method.min_amount,
      max_amount: method.max_amount || 0
    });
  };

  const handleSave = () => {
    if (!editingMethod) return;
    updateMutation.mutate({
      id: editingMethod.id,
      updates: {
        display_name: editForm.display_name,
        description: editForm.description,
        processing_fee_percentage: editForm.processing_fee_percentage,
        processing_fee_fixed: editForm.processing_fee_fixed,
        min_amount: editForm.min_amount,
        max_amount: editForm.max_amount || null
      }
    });
  };
  
  const PaymentIcon = ({ icon }: { icon: string | null }) => {
    const IconComponent = iconMap[icon || ''] || CreditCard;
    return <IconComponent className="h-5 w-5" />;
  };

  const getMethodStatus = (method: PaymentSetting) => {
    if (!method.enabled) return { color: 'bg-gray-100 text-gray-600', text: 'Disabled' };
    if (method.payment_method === 'bnpl') return { color: 'bg-amber-100 text-amber-700', text: 'KYC Required' };
    return { color: 'bg-green-100 text-green-700', text: 'Active' };
  };

  // Stats
  const stats = {
    total: paymentMethods?.length || 0,
    enabled: paymentMethods?.filter(m => m.enabled).length || 0,
    disabled: paymentMethods?.filter(m => !m.enabled).length || 0
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Methods</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.enabled}</p>
                <p className="text-xs text-muted-foreground">Enabled</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <AlertCircle className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.disabled}</p>
                <p className="text-xs text-muted-foreground">Disabled</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Payment Methods Management
          </CardTitle>
          <CardDescription>
            Enable, disable, and configure payment methods available at checkout
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Methods</TabsTrigger>
              <TabsTrigger value="enabled">Enabled</TabsTrigger>
              <TabsTrigger value="disabled">Disabled</TabsTrigger>
            </TabsList>

            {['all', 'enabled', 'disabled'].map(tab => (
              <TabsContent key={tab} value={tab}>
                <div className="space-y-4">
                  {paymentMethods
                    ?.filter(m => {
                      if (tab === 'enabled') return m.enabled;
                      if (tab === 'disabled') return !m.enabled;
                      return true;
                    })
                    .map((method) => {
                      const status = getMethodStatus(method);
                      return (
                        <div 
                          key={method.id}
                          className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${
                            method.enabled ? 'bg-white' : 'bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-lg ${method.enabled ? 'bg-primary/10' : 'bg-gray-200'}`}>
                              <PaymentIcon icon={method.icon} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">{method.display_name}</h4>
                                <Badge variant="outline" className={status.color}>
                                  {status.text}
                                </Badge>
                                {method.payment_method === 'mpesa' && (
                                  <Badge variant="secondary" className="text-xs">Popular</Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {method.description}
                              </p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                {method.processing_fee_percentage > 0 && (
                                  <span>Fee: {method.processing_fee_percentage}%
                                    {method.processing_fee_fixed > 0 && ` + KES ${method.processing_fee_fixed}`}
                                  </span>
                                )}
                                {method.min_amount > 0 && (
                                  <span>Min: KES {method.min_amount.toLocaleString()}</span>
                                )}
                                {method.max_amount && (
                                  <span>Max: KES {method.max_amount.toLocaleString()}</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => openEditDialog(method)}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Configure
                            </Button>
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
                      );
                    })}
                </div>
              </TabsContent>
            ))}
          </Tabs>
          
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <h4 className="font-medium text-amber-800 mb-2 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Important Notes
            </h4>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• M-Pesa is the most popular payment method in Kenya - keep it enabled</li>
              <li>• Buy Now, Pay Later requires customers to complete KYC verification</li>
              <li>• Cash on Delivery may increase delivery risk - consider enabling for trusted customers only</li>
              <li>• Processing fees are automatically calculated and shown to customers at checkout</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingMethod} onOpenChange={(open) => !open && setEditingMethod(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PaymentIcon icon={editingMethod?.icon || null} />
              Configure {editingMethod?.display_name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Display Name</Label>
              <Input
                value={editForm.display_name}
                onChange={(e) => setEditForm({ ...editForm, display_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Processing Fee (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={editForm.processing_fee_percentage}
                  onChange={(e) => setEditForm({ ...editForm, processing_fee_percentage: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Fixed Fee (KES)</Label>
                <Input
                  type="number"
                  value={editForm.processing_fee_fixed}
                  onChange={(e) => setEditForm({ ...editForm, processing_fee_fixed: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Minimum Amount (KES)</Label>
                <Input
                  type="number"
                  value={editForm.min_amount}
                  onChange={(e) => setEditForm({ ...editForm, min_amount: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Maximum Amount (KES)</Label>
                <Input
                  type="number"
                  placeholder="No limit"
                  value={editForm.max_amount || ''}
                  onChange={(e) => setEditForm({ ...editForm, max_amount: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingMethod(null)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentMethodsSettings;
