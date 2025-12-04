
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Award } from "lucide-react";
import { useLoyaltySettings, useUpdateLoyaltySettings } from "@/hooks/useLoyaltySettings";
import { Separator } from "@/components/ui/separator";

const LoyaltySettingsForm = () => {
  const { data: settings, isLoading } = useLoyaltySettings();
  const updateMutation = useUpdateLoyaltySettings();
  
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
    <Card>
      <CardHeader>
        <CardTitle>Loyalty Points Settings</CardTitle>
        <CardDescription>Configure points earning rates and tier thresholds</CardDescription>
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
  );
};

export default LoyaltySettingsForm;
