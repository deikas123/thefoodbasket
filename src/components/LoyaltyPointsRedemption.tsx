
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Award } from "lucide-react";
import { useLoyaltySettings } from "@/hooks/useLoyaltySettings";
import { redeemLoyaltyPoints } from "@/services/loyaltyService";
import { toast } from "@/hooks/use-toast";
import { formatCurrency } from "@/utils/currencyFormatter";

interface LoyaltyPointsRedemptionProps {
  availablePoints: number;
  onRedemptionSuccess: () => void;
}

const LoyaltyPointsRedemption = ({ 
  availablePoints, 
  onRedemptionSuccess 
}: LoyaltyPointsRedemptionProps) => {
  const [pointsToRedeem, setPointsToRedeem] = useState<number>(0);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const { data: settings } = useLoyaltySettings();
  
  const kshValue = pointsToRedeem * (settings?.ksh_per_point || 1);
  const minPoints = settings?.min_redemption_points || 100;
  
  const handleRedeem = async () => {
    if (pointsToRedeem < minPoints) {
      toast({
        title: "Insufficient Points",
        description: `Minimum redemption is ${minPoints} points`,
        variant: "destructive",
      });
      return;
    }
    
    if (pointsToRedeem > availablePoints) {
      toast({
        title: "Insufficient Points",
        description: "You don't have enough points for this redemption",
        variant: "destructive",
      });
      return;
    }
    
    setIsRedeeming(true);
    
    try {
      const result = await redeemLoyaltyPoints(pointsToRedeem, kshValue);
      
      if (result) {
        toast({
          title: "Redemption Successful",
          description: `${pointsToRedeem} points redeemed for ${formatCurrency(kshValue)}`,
        });
        setPointsToRedeem(0);
        onRedemptionSuccess();
      } else {
        throw new Error('Redemption failed');
      }
    } catch (error) {
      toast({
        title: "Redemption Failed",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsRedeeming(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          Redeem Points
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="points-input">Points to Redeem</Label>
          <Input
            id="points-input"
            type="number"
            min={minPoints}
            max={availablePoints}
            value={pointsToRedeem}
            onChange={(e) => setPointsToRedeem(Number(e.target.value))}
            placeholder={`Min ${minPoints} points`}
          />
          <p className="text-sm text-muted-foreground mt-1">
            Available: {availablePoints} points
          </p>
        </div>
        
        {pointsToRedeem > 0 && (
          <div className="bg-muted p-3 rounded-lg">
            <p className="font-medium">Redemption Value</p>
            <p className="text-lg font-bold text-primary">
              {formatCurrency(kshValue)}
            </p>
          </div>
        )}
        
        <Button 
          onClick={handleRedeem}
          disabled={isRedeeming || pointsToRedeem < minPoints || pointsToRedeem > availablePoints}
          className="w-full"
        >
          {isRedeeming ? "Processing..." : `Redeem ${pointsToRedeem} Points`}
        </Button>
        
        <p className="text-xs text-muted-foreground">
          Redeemed points will be added to your wallet as credit
        </p>
      </CardContent>
    </Card>
  );
};

export default LoyaltyPointsRedemption;
