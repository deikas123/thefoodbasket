
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Award, Users, Clock, TrendingUp, ArrowUp, ArrowDown, Wallet } from "lucide-react";
import { useLoyaltySettings, useUpdateLoyaltySettings } from "@/hooks/useLoyaltySettings";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { getLoyaltyStats } from "@/services/loyaltyService";
import { formatCurrency } from "@/utils/currencyFormatter";

const LoyaltySettingsForm = () => {
  const { data: settings, isLoading } = useLoyaltySettings();
  const updateMutation = useUpdateLoyaltySettings();
  
  const { data: stats } = useQuery({
    queryKey: ['loyalty-stats'],
    queryFn: getLoyaltyStats,
    staleTime: 60000,
  });
  
  const [formData, setFormData] = useState({
    points_per_ksh: 1.0,
    ksh_per_point: 1.0,
    min_redemption_points: 100,
    bronze_threshold: 0,
    silver_threshold: 500,
    gold_threshold: 2000,
    bronze_multiplier: 1.0,
    silver_multiplier: 1.5,
    gold_multiplier: 2.0,
    points_expiration_days: 365,
    referral_signup_bonus: 100,
    referral_purchase_bonus: 200,
  });
  
  useEffect(() => {
    if (settings) {
      setFormData({
        points_per_ksh: settings.points_per_ksh,
        ksh_per_point: settings.ksh_per_point,
        min_redemption_points: settings.min_redemption_points,
        bronze_threshold: settings.bronze_threshold ?? 0,
        silver_threshold: settings.silver_threshold ?? 500,
        gold_threshold: settings.gold_threshold ?? 2000,
        bronze_multiplier: settings.bronze_multiplier ?? 1.0,
        silver_multiplier: settings.silver_multiplier ?? 1.5,
        gold_multiplier: settings.gold_multiplier ?? 2.0,
        points_expiration_days: settings.points_expiration_days ?? 365,
        referral_signup_bonus: settings.referral_signup_bonus ?? 100,
        referral_purchase_bonus: settings.referral_purchase_bonus ?? 200,
      });
    }
  }, [settings]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (settings) {
      updateMutation.mutate({
        id: settings.id,
        ...formData,
      });
    }
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Points Issued</p>
                <p className="text-2xl font-bold">{stats?.totalPointsIssued.toLocaleString() || 0}</p>
              </div>
              <ArrowUp className="h-8 w-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Points Redeemed</p>
                <p className="text-2xl font-bold">{stats?.totalPointsRedeemed.toLocaleString() || 0}</p>
              </div>
              <ArrowDown className="h-8 w-8 text-orange-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Redemption Value</p>
                <p className="text-2xl font-bold">{formatCurrency(stats?.totalRedemptionValue || 0)}</p>
              </div>
              <Wallet className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">{stats?.activeUsers || 0}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Points/User</p>
                <p className="text-2xl font-bold">{stats?.avgPointsPerUser.toLocaleString() || 0}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Loyalty Points Settings</CardTitle>
          <CardDescription>Configure points earning rates, tier thresholds, referral bonuses, and expiration</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Base Settings */}
            <div>
              <h3 className="font-medium mb-3">Base Point Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="points_per_ksh">Points per KSH Spent</Label>
                  <Input
                    id="points_per_ksh"
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.points_per_ksh}
                    onChange={(e) => setFormData({
                      ...formData,
                      points_per_ksh: parseFloat(e.target.value) || 0
                    })}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Base points earned per KSH
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="ksh_per_point">KSH Value per Point</Label>
                  <Input
                    id="ksh_per_point"
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.ksh_per_point}
                    onChange={(e) => setFormData({
                      ...formData,
                      ksh_per_point: parseFloat(e.target.value) || 0
                    })}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    KSH value when redeeming
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="min_redemption_points">Min Redemption Points</Label>
                  <Input
                    id="min_redemption_points"
                    type="number"
                    min="1"
                    value={formData.min_redemption_points}
                    onChange={(e) => setFormData({
                      ...formData,
                      min_redemption_points: parseInt(e.target.value) || 1
                    })}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Minimum points to redeem
                  </p>
                </div>
              </div>
            </div>
            
            <Separator />
            
            {/* Referral Settings */}
            <div>
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Referral Bonuses
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Configure bonus points for referral program
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="referral_signup_bonus">Signup Bonus</Label>
                  <Input
                    id="referral_signup_bonus"
                    type="number"
                    min="0"
                    value={formData.referral_signup_bonus}
                    onChange={(e) => setFormData({
                      ...formData,
                      referral_signup_bonus: parseInt(e.target.value) || 0
                    })}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Points awarded when a referred user signs up
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="referral_purchase_bonus">First Purchase Bonus</Label>
                  <Input
                    id="referral_purchase_bonus"
                    type="number"
                    min="0"
                    value={formData.referral_purchase_bonus}
                    onChange={(e) => setFormData({
                      ...formData,
                      referral_purchase_bonus: parseInt(e.target.value) || 0
                    })}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Bonus points when referred user makes first purchase
                  </p>
                </div>
              </div>
            </div>
            
            <Separator />
            
            {/* Expiration Settings */}
            <div>
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Points Expiration
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Points expire after a period of inactivity (no purchases or earning)
              </p>
              
              <div className="max-w-xs">
                <Label htmlFor="points_expiration_days">Expiration Period (days)</Label>
                <Input
                  id="points_expiration_days"
                  type="number"
                  min="0"
                  value={formData.points_expiration_days}
                  onChange={(e) => setFormData({
                    ...formData,
                    points_expiration_days: parseInt(e.target.value) || 0
                  })}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Set to 0 to disable expiration
                </p>
              </div>
            </div>
            
            <Separator />
            
            {/* Tier Settings */}
            <div>
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <Award className="h-4 w-4" />
                Loyalty Tiers
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Higher tiers earn more points based on the multiplier (e.g., 1.5x means 50% more points)
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Bronze Tier */}
                <div className="p-4 rounded-lg border bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 rounded-full bg-amber-600" />
                    <h4 className="font-medium text-amber-800 dark:text-amber-400">Bronze</h4>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="bronze_threshold" className="text-xs">Points Threshold</Label>
                      <Input
                        id="bronze_threshold"
                        type="number"
                        min="0"
                        value={formData.bronze_threshold}
                        onChange={(e) => setFormData({
                          ...formData,
                          bronze_threshold: parseInt(e.target.value) || 0
                        })}
                        className="bg-white dark:bg-background"
                      />
                    </div>
                    <div>
                      <Label htmlFor="bronze_multiplier" className="text-xs">Points Multiplier</Label>
                      <Input
                        id="bronze_multiplier"
                        type="number"
                        step="0.1"
                        min="1"
                        value={formData.bronze_multiplier}
                        onChange={(e) => setFormData({
                          ...formData,
                          bronze_multiplier: parseFloat(e.target.value) || 1
                        })}
                        className="bg-white dark:bg-background"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Silver Tier */}
                <div className="p-4 rounded-lg border bg-slate-50 dark:bg-slate-950/20 border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 rounded-full bg-slate-400" />
                    <h4 className="font-medium text-slate-700 dark:text-slate-300">Silver</h4>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="silver_threshold" className="text-xs">Points Threshold</Label>
                      <Input
                        id="silver_threshold"
                        type="number"
                        min="0"
                        value={formData.silver_threshold}
                        onChange={(e) => setFormData({
                          ...formData,
                          silver_threshold: parseInt(e.target.value) || 0
                        })}
                        className="bg-white dark:bg-background"
                      />
                    </div>
                    <div>
                      <Label htmlFor="silver_multiplier" className="text-xs">Points Multiplier</Label>
                      <Input
                        id="silver_multiplier"
                        type="number"
                        step="0.1"
                        min="1"
                        value={formData.silver_multiplier}
                        onChange={(e) => setFormData({
                          ...formData,
                          silver_multiplier: parseFloat(e.target.value) || 1
                        })}
                        className="bg-white dark:bg-background"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Gold Tier */}
                <div className="p-4 rounded-lg border bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-700">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <h4 className="font-medium text-yellow-700 dark:text-yellow-400">Gold</h4>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="gold_threshold" className="text-xs">Points Threshold</Label>
                      <Input
                        id="gold_threshold"
                        type="number"
                        min="0"
                        value={formData.gold_threshold}
                        onChange={(e) => setFormData({
                          ...formData,
                          gold_threshold: parseInt(e.target.value) || 0
                        })}
                        className="bg-white dark:bg-background"
                      />
                    </div>
                    <div>
                      <Label htmlFor="gold_multiplier" className="text-xs">Points Multiplier</Label>
                      <Input
                        id="gold_multiplier"
                        type="number"
                        step="0.1"
                        min="1"
                        value={formData.gold_multiplier}
                        onChange={(e) => setFormData({
                          ...formData,
                          gold_multiplier: parseFloat(e.target.value) || 1
                        })}
                        className="bg-white dark:bg-background"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Update Settings
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoyaltySettingsForm;
