
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Award, Wallet, Check, Loader2 } from "lucide-react";
import { useLoyaltySettings } from "@/hooks/useLoyaltySettings";
import { redeemLoyaltyPoints } from "@/services/loyaltyService";
import { toast } from "sonner";
import { formatCurrency } from "@/utils/currencyFormatter";
import { cn } from "@/lib/utils";

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
  
  const kshPerPoint = settings?.ksh_per_point || 0.1;
  const kshValue = pointsToRedeem * kshPerPoint;
  const minPoints = settings?.min_redemption_points || 100;
  
  // Quick redeem options
  const quickOptions = [
    { label: '25%', percent: 0.25 },
    { label: '50%', percent: 0.5 },
    { label: '75%', percent: 0.75 },
    { label: 'All', percent: 1 },
  ];
  
  const handleQuickSelect = (percent: number) => {
    const points = Math.floor(availablePoints * percent);
    setPointsToRedeem(Math.max(minPoints, points));
  };
  
  const handleSliderChange = (value: number[]) => {
    setPointsToRedeem(value[0]);
  };
  
  const handleRedeem = async () => {
    if (pointsToRedeem < minPoints) {
      toast.error(`Minimum redemption is ${minPoints} points`);
      return;
    }
    
    if (pointsToRedeem > availablePoints) {
      toast.error("You don't have enough points");
      return;
    }
    
    setIsRedeeming(true);
    
    try {
      const result = await redeemLoyaltyPoints(pointsToRedeem, kshValue);
      
      if (result) {
        toast.success(
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4" />
            <span>{formatCurrency(kshValue)} added to your wallet!</span>
          </div>
        );
        setPointsToRedeem(0);
        onRedemptionSuccess();
      } else {
        throw new Error('Redemption failed');
      }
    } catch (error) {
      toast.error("Redemption failed. Please try again.");
    } finally {
      setIsRedeeming(false);
    }
  };
  
  const canRedeem = availablePoints >= minPoints;
  const isValidAmount = pointsToRedeem >= minPoints && pointsToRedeem <= availablePoints;
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" />
          Redeem Points
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {!canRedeem ? (
          <div className="text-center py-6 space-y-2">
            <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
              <Award className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="font-medium">Not enough points yet</p>
            <p className="text-sm text-muted-foreground">
              You need at least {minPoints} points to redeem. Keep shopping to earn more!
            </p>
          </div>
        ) : (
          <>
            {/* Available Points Display */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Available Points</p>
              <p className="text-3xl font-bold text-primary">{availablePoints.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">
                Worth up to {formatCurrency(availablePoints * kshPerPoint)}
              </p>
            </div>
            
            {/* Quick Select Buttons */}
            <div className="grid grid-cols-4 gap-2">
              {quickOptions.map((option) => {
                const points = Math.floor(availablePoints * option.percent);
                const isDisabled = points < minPoints;
                const isSelected = pointsToRedeem === points;
                
                return (
                  <Button
                    key={option.label}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    disabled={isDisabled}
                    onClick={() => handleQuickSelect(option.percent)}
                    className={cn(
                      "transition-all",
                      isSelected && "ring-2 ring-primary ring-offset-2"
                    )}
                  >
                    {option.label}
                  </Button>
                );
              })}
            </div>
            
            {/* Slider */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Points to redeem</span>
                <span className="font-mono font-bold">{pointsToRedeem.toLocaleString()}</span>
              </div>
              <Slider
                value={[pointsToRedeem]}
                onValueChange={handleSliderChange}
                min={0}
                max={availablePoints}
                step={10}
                className="py-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0</span>
                <span>{availablePoints.toLocaleString()}</span>
              </div>
            </div>
            
            {/* Value Preview */}
            {pointsToRedeem > 0 && (
              <div className={cn(
                "p-4 rounded-lg border-2 transition-all",
                isValidAmount 
                  ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
                  : "bg-muted border-transparent"
              )}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-green-600" />
                    <span className="font-medium">You'll receive</span>
                  </div>
                  <span className="text-2xl font-bold text-green-600">
                    {formatCurrency(kshValue)}
                  </span>
                </div>
                {!isValidAmount && pointsToRedeem > 0 && pointsToRedeem < minPoints && (
                  <p className="text-xs text-amber-600 mt-2">
                    Minimum {minPoints} points required
                  </p>
                )}
              </div>
            )}
            
            {/* Redeem Button */}
            <Button 
              onClick={handleRedeem}
              disabled={isRedeeming || !isValidAmount}
              className="w-full h-12 text-lg"
              size="lg"
            >
              {isRedeeming ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Wallet className="h-5 w-5 mr-2" />
                  Redeem {pointsToRedeem.toLocaleString()} Points
                </>
              )}
            </Button>
            
            <p className="text-xs text-center text-muted-foreground">
              Points will be converted to wallet credit instantly
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default LoyaltyPointsRedemption;
