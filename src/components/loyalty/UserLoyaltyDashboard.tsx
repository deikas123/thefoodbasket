
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Gift, History, TrendingUp } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLoyaltySettings } from "@/hooks/useLoyaltySettings";
import LoyaltyPointsRedemption from "@/components/LoyaltyPointsRedemption";
import { formatCurrency } from "@/utils/currencyFormatter";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const UserLoyaltyDashboard = () => {
  const { user } = useAuth();
  const { data: settings } = useLoyaltySettings();
  
  // Fetch user profile to get loyalty points
  const { data: profile, refetch: refetchProfile } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      console.log('Fetching loyalty points for user:', user.id);
      const { data, error } = await supabase
        .from('profiles')
        .select('loyalty_points')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      console.log('User loyalty points:', data?.loyalty_points);
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
  const pointsToNextLevel = 500;
  const currentLevel = Math.floor(userPoints / 500);
  const levelNames = ["Bronze", "Silver", "Gold", "Platinum"];

  const handleRedemptionSuccess = () => {
    // Refresh user data
    refetchProfile();
    console.log("Points redeemed successfully");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Loyalty Rewards</h1>
        <p className="text-muted-foreground">
          Earn points with every purchase and redeem them for rewards
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{userPoints}</div>
            <p className="text-xs text-muted-foreground">
              Worth {formatCurrency(userPoints * (settings?.ksh_per_point || 1))}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Level</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{levelNames[currentLevel] || "Bronze"}</div>
            <p className="text-xs text-muted-foreground">
              {Math.max(0, pointsToNextLevel - (userPoints % 500))} points to next level
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Points Rate</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{settings?.points_per_ksh || 1}</div>
            <p className="text-xs text-muted-foreground">
              Points per KSH spent
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Redemption Value</CardTitle>
            <History className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(settings?.ksh_per_point || 1)}</div>
            <p className="text-xs text-muted-foreground">
              Per point redeemed
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Points Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Current Level: {levelNames[currentLevel] || "Bronze"}</span>
                  <span>{userPoints % 500} / 500</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${Math.min(100, ((userPoints % 500) / 500) * 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {Math.max(0, pointsToNextLevel - (userPoints % 500))} points needed for {levelNames[currentLevel + 1] || "Max Level"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How to Earn Points</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Every KSH spent</span>
                  <Badge variant="secondary">{settings?.points_per_ksh || 1} points</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Product review</span>
                  <Badge variant="secondary">20 points</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Refer a friend</span>
                  <Badge variant="secondary">100 points</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Birthday bonus</span>
                  <Badge variant="secondary">50 points</Badge>
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
                        className={activity.points_redeemed > 0 ? "text-red-600" : "text-green-600"}
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
