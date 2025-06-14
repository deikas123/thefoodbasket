
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useLoyaltySettings, useUpdateLoyaltySettings } from "@/hooks/useLoyaltySettings";

const LoyaltySettingsForm = () => {
  const { data: settings, isLoading } = useLoyaltySettings();
  const updateMutation = useUpdateLoyaltySettings();
  
  const [formData, setFormData] = useState({
    points_per_ksh: 1.0,
    ksh_per_point: 1.0,
    min_redemption_points: 100,
  });
  
  useEffect(() => {
    if (settings) {
      setFormData({
        points_per_ksh: settings.points_per_ksh,
        ksh_per_point: settings.ksh_per_point,
        min_redemption_points: settings.min_redemption_points,
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
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <p className="text-sm text-muted-foreground mt-1">
                How many points customers earn per KSH spent
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
              <p className="text-sm text-muted-foreground mt-1">
                KSH value when redeeming points
              </p>
            </div>
          </div>
          
          <div>
            <Label htmlFor="min_redemption_points">Minimum Redemption Points</Label>
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
            <p className="text-sm text-muted-foreground mt-1">
              Minimum points required for redemption
            </p>
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
