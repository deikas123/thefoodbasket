
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Gift, History, TrendingUp, Zap } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLoyaltySettings } from "@/hooks/useLoyaltySettings";
import LoyaltyPointsRedemption from "@/components/LoyaltyPointsRedemption";
import { formatCurrency } from "@/utils/currencyFormatter";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getTierFromPoints, getTierMultiplier, LoyaltyTier } from "@/types/loyalty";
import { cn } from "@/lib/utils";

const tierConfig: Record<LoyaltyTier, { label: string; color: string; bgColor: string; borderColor: string }> = {
  bronze: { 
    label: 'Bronze', 
    color: 'text-amber-700 dark:text-amber-400',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    borderColor: 'border-amber-300 dark:border-amber-700'
  },
  silver: { 
    label: 'Silver', 
    color: 'text-slate-600 dark:text-slate-300',
    bgColor: 'bg-slate-100 dark:bg-slate-800/50',
    borderColor: 'border-slate-300 dark:border-slate-600'
  },
  gold: { 
    label: 'Gold', 
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    borderColor: 'border-yellow-300 dark:border-yellow-600'
  },
};

const UserLoyaltyDashboard = () => {
  const { user } = useAuth();
  const { data: settings } = useLoyaltySettings();
  
  // Fetch user profile to get loyalty points
  const { data: profile, refetch: refetchProfile } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('loyalty_points')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch recent loyalty activity
  const { data: recentActivity } = useQuery({
    queryKey: ['loyalty-activity', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('loyalty_redemptions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) {
        console.error('Error fetching loyalty activity:', error);
        return [];
      }
      return data || [];
    },
    enabled: !!user?.id,
  });

  const userPoints = profile?.loyalty_points || 0;
  const currentTier = getTierFromPoints(userPoints, settings || null);
  const currentMultiplier = getTierMultiplier(currentTier, settings || null);
  const tierInfo = tierConfig[currentTier];

  // Calculate progress to next tier
  const getNextTierInfo = () => {
    if (!settings) return { nextTier: null, pointsNeeded: 0, progress: 0 };
    
    if (currentTier === 'bronze') {
      const progress = (userPoints / settings.silver_threshold) * 100;
      return { 
        nextTier: 'Silver', 
        pointsNeeded: settings.silver_threshold - userPoints,
        progress: Math.min(progress, 100)
      };
    } else if (currentTier === 'silver') {
      const progress = ((userPoints - settings.silver_threshold) / (settings.gold_threshold - settings.silver_threshold)) * 100;
      return { 
        nextTier: 'Gold', 
        pointsNeeded: settings.gold_threshold - userPoints,
        progress: Math.min(progress, 100)
      };
    }
    return { nextTier: null, pointsNeeded: 0, progress: 100 };
  };

  const nextTierInfo = getNextTierInfo();

  const handleRedemptionSuccess = () => {
    refetchProfile();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Loyalty Rewards</h1>
        <p className="text-muted-foreground">
          Earn points with every purchase and redeem them for rewards
        </p>
      </div>

      {/* Current Tier Banner */}
      <Card className={cn("border-2", tierInfo.borderColor, tierInfo.bgColor)}>
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={cn("p-3 rounded-full", tierInfo.bgColor)}>
                <Award className={cn("h-8 w-8", tierInfo.color)} />
              </div>
              <div>
                <h2 className={cn("text-2xl font-bold", tierInfo.color)}>
                  {tierInfo.label} Member
                </h2>
                <p className="text-muted-foreground">
                  {userPoints.toLocaleString()} points • {currentMultiplier}x points multiplier
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className={cn("text-3xl font-bold", tierInfo.color)}>
                {formatCurrency(userPoints * (settings?.ksh_per_point || 0.1))}
              </div>
              <p className="text-sm text-muted-foreground">Redemption value</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{userPoints.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Worth {formatCurrency(userPoints * (settings?.ksh_per_point || 0.1))}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Points Multiplier</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentMultiplier}x</div>
            <p className="text-xs text-muted-foreground">
              {tierInfo.label} tier bonus
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Base Rate</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{settings?.points_per_ksh || 1}</div>
            <p className="text-xs text-muted-foreground">
              Points per KSH × {currentMultiplier}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          {/* Progress to Next Tier */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Tier Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {nextTierInfo.nextTier ? (
                  <>
                    <div className="flex justify-between text-sm">
                      <span>{tierInfo.label}</span>
                      <span>{nextTierInfo.nextTier}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3">
                      <div 
                        className="bg-primary h-3 rounded-full transition-all duration-300" 
                        style={{ width: `${nextTierInfo.progress}%` }}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground text-center">
                      <span className="font-medium">{nextTierInfo.pointsNeeded.toLocaleString()}</span> more points to reach {nextTierInfo.nextTier}
                    </p>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <Badge className={cn(tierInfo.bgColor, tierInfo.color, "text-lg py-2 px-4")}>
                      🏆 Maximum Tier Achieved!
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-2">
                      You're earning {currentMultiplier}x points on every purchase
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tier Benefits */}
          <Card>
            <CardHeader>
              <CardTitle>Tier Benefits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className={cn("p-3 rounded-lg border", userPoints >= 0 ? "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800" : "opacity-50")}>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-amber-700 dark:text-amber-400">Bronze</span>
                    <Badge variant="outline">{settings?.bronze_multiplier || 1}x points</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{settings?.bronze_threshold || 0}+ points</p>
                </div>
                <div className={cn("p-3 rounded-lg border", userPoints >= (settings?.silver_threshold || 500) ? "bg-slate-50 dark:bg-slate-900/20 border-slate-200 dark:border-slate-700" : "opacity-50")}>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-slate-600 dark:text-slate-300">Silver</span>
                    <Badge variant="outline">{settings?.silver_multiplier || 1.5}x points</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{settings?.silver_threshold || 500}+ points</p>
                </div>
                <div className={cn("p-3 rounded-lg border", userPoints >= (settings?.gold_threshold || 2000) ? "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-700" : "opacity-50")}>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-yellow-600 dark:text-yellow-400">Gold</span>
                    <Badge variant="outline">{settings?.gold_multiplier || 2}x points</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{settings?.gold_threshold || 2000}+ points</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <LoyaltyPointsRedemption
            availablePoints={userPoints}
            onRedemptionSuccess={handleRedemptionSuccess}
          />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity && recentActivity.length > 0 ? (
                  recentActivity.map((activity) => (
                    <div key={activity.id} className="flex justify-between items-center py-2 border-b">
                      <div>
                        <p className="font-medium">
                          {activity.status === 'completed' ? 'Points Redemption' : 'Pending Redemption'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(activity.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge 
                        variant="outline" 
                        className="text-destructive"
                      >
                        -{activity.points_redeemed} pts
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    <p>No recent activity</p>
                    <p className="text-sm">Start earning points by making purchases!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserLoyaltyDashboard;
